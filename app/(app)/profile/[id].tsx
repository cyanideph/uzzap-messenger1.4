import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { useColorScheme } from '~/lib/useColorScheme';
import { ArrowLeft, User, MapPin, Calendar, MessageSquare, Edit2, Camera, AtSign } from 'lucide-react-native';
import { supabase, uploadAvatar, getGalleryImages } from '~/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { GalleryView } from '~/components/gallery/GalleryView';
import { StatusUpdate } from '~/components/status/StatusUpdate';
import { RelationshipActions } from '~/components/relationships/RelationshipActions';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  location: string;
  avatar: string | null;
  joinDate: Date;
  followerCount: number;
  followingCount: number;
  isSelf: boolean;
  isFollowing: boolean;
  status_message?: string;
  last_status_update?: string;
  relationship?: string;
}

// Fetch a user profile from Supabase

export default function ProfileScreen() {
  const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
  const { user } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // Determine if this is the current user's profile
  const isSelfProfile = id === user?.id || id === 'me';

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) return;

    setUploading(true);
    try {
      const fetchTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const fetchResponse = await Promise.race([fetch(uri), fetchTimeout]);
      
      if (!(fetchResponse instanceof Response)) {
        throw new Error('Invalid response');
      }

      const blob = await fetchResponse.blob();
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const { error } = await uploadAvatar(user.id, file);

      if (error) {
        console.error('Error uploading avatar:', error);
        Alert.alert('Error', 'Failed to upload avatar');
      } else {
        Alert.alert('Success', 'Avatar uploaded successfully!');
        fetchUserProfile();
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const profileId = (isSelfProfile && user) ? user.id : id;

      if (!profileId) {
        console.error('No profile ID available');
        setLoading(false);
        return;
      }

      // Fetch user profile data with location in a single query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_relationships!user_relationships_related_user_id_fkey(relationship_type),
          users!inner(location)
        `)
        .eq('id', profileId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // Update location handling
      const location = profileData.users?.location || 'Unknown';

      // Create user profile object
      const userProfile: UserProfile = {
        id: profileData.id,
        username: profileData.username,
        name: profileData.full_name || profileData.username,
        bio: profileData.bio || '',
        location: location,
        avatar: profileData.avatar_url,
        joinDate: new Date(profileData.created_at),
        followerCount: profileData.follower_count || 0,
        followingCount: profileData.following_count || 0,
        isSelf: isSelfProfile,
        isFollowing: profileData.is_following || false,
        status_message: profileData.status_message || '',
        last_status_update: profileData.last_status_update,
        relationship: profileData.user_relationships?.[0]?.relationship_type,
      };

      setProfile(userProfile);
      setEditedProfile({
        name: userProfile.name,
        username: userProfile.username,
        bio: userProfile.bio,
        location: userProfile.location,
      });
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async () => {
    const profileId = (isSelfProfile && user) ? user.id : id;
    const { data, error } = await getGalleryImages(profileId);
    if (!error && data) {
      setGalleryImages(data);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchGalleryImages();
  }, [id, user?.id, isSelfProfile]);

  const toggleFollow = async () => {
    if (!profile || !user?.id) return;

    try {
      if (profile.isFollowing) {
        // Unfollow user
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) {
          console.error('Error unfollowing user:', error);
          return;
        }
      } else {
        // Follow user
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error following user:', error);
          return;
        }
      }

      // Update local state
      setProfile({
        ...profile,
        isFollowing: !profile.isFollowing,
        followerCount: profile.isFollowing
          ? profile.followerCount - 1
          : profile.followerCount + 1,
      });
    } catch (error) {
      console.error('Unexpected error in toggleFollow:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile || !user?.id) return;

    // Validate fields (basic validation)
    if (!editedProfile.name?.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!editedProfile.username?.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    try {
      // Check if username is already taken (if changed)
      if (editedProfile.username !== profile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', editedProfile.username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          Alert.alert('Error', 'Username is already taken');
          return;
        }
      }

      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          full_name: editedProfile.name,
          bio: editedProfile.bio,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      // Update location in users table
      if (editedProfile.location !== profile.location) {
        const { error: locationError } = await supabase
          .from('users')
          .update({ location: editedProfile.location })
          .eq('id', user.id);

        if (locationError) {
          console.error('Error updating location:', locationError);
        }
      }

      // Update local state
      setProfile({
        ...profile,
        ...editedProfile,
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Unexpected error in saveProfile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (!profile || loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4">Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isEditing ? 'Edit Profile' : profile.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  // If editing, ask for confirmation before going back
                  Alert.alert(
                    'Discard Changes',
                    'Are you sure you want to discard your changes?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Discard',
                        onPress: () => {
                          setIsEditing(false);
                          // Reset edited profile
                          setEditedProfile({
                            name: profile.name,
                            username: profile.username,
                            bio: profile.bio,
                            location: profile.location,
                          });
                        },
                      },
                    ]
                  );
                } else {
                  router.back();
                }
              }}
              className="mr-2"
            >
              <ArrowLeft size={24} color={isDarkColorScheme ? '#fff' : '#000'} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            profile.isSelf && !isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Edit2 size={22} color={isDarkColorScheme ? '#fff' : '#000'} />
              </TouchableOpacity>
            ) : null
          ),
        }}
      />

      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          {/* Profile Header */}
          <Card className="p-4 mb-6 border border-border">
            <View className="items-center">
              {/* Profile Image */}
              <View className="mb-4 relative">
                {isEditing ? (
                  <TouchableOpacity
                    className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center"
                    onPress={() => {
                      if (uploading) return;
                      Alert.alert(
                        'Upload Photo',
                        'Choose how to upload',
                        [
                          {
                            text: 'Choose from Library',
                            onPress: () => pickImage(),
                          },
                          {
                            text: 'Take Photo',
                            onPress: () => takePhoto(),
                          },
                          { text: 'Cancel', style: 'cancel' },
                        ],
                        { cancelable: true }
                      );
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="#0000ff" />
                    ) : profile.avatar ? (
                      <Image source={{ uri: profile.avatar }} className="w-24 h-24 rounded-full" />
                    ) : (
                      <>
                        <Text className="text-primary text-3xl font-semibold">
                          {profile.name?.substring(0, 1).toUpperCase() || 'U'}
                        </Text>
                        <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
                          <Camera size={16} className="text-white" />
                        </View>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
                    {profile.avatar ? (
                      <Image source={{ uri: profile.avatar }} className="w-24 h-24 rounded-full" />
                    ) : (
                      <Text className="text-primary text-3xl font-semibold">
                        {profile.name?.substring(0, 1).toUpperCase() || 'U'}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Profile Information */}
              {isEditing ? (
                <View className="w-full px-2">
                  <Text className="font-medium mb-1">Name</Text>
                  <TextInput
                    className="w-full bg-muted rounded-lg p-2 mb-3 text-foreground"
                    value={editedProfile.name}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
                    placeholder="Your name"
                    placeholderTextColor="#9ca3af"
                  />

                  <View className="flex-row items-center mb-1">
                    <AtSign size={14} className="text-muted-foreground mr-1" />
                    <Text className="font-medium">Username</Text>
                  </View>
                  <TextInput
                    className="w-full bg-muted rounded-lg p-2 mb-3 text-foreground"
                    value={editedProfile.username}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, username: text })}
                    placeholder="Your username"
                    placeholderTextColor="#9ca3af"
                  />

                  <View className="flex-row items-center mb-1">
                    <MapPin size={14} className="text-muted-foreground mr-1" />
                    <Text className="font-medium">Location</Text>
                  </View>
                  <TextInput
                    className="w-full bg-muted rounded-lg p-2 mb-3 text-foreground"
                    value={editedProfile.location}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, location: text })}
                    placeholder="Your location"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text className="font-medium mb-1">Bio</Text>
                  <TextInput
                    className="w-full bg-muted rounded-lg p-2 mb-3 text-foreground"
                    value={editedProfile.bio}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, bio: text })}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <Button className="w-full mt-4" onPress={saveProfile}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-semibold">Save Profile</Text>
                    )}
                  </Button>
                </View>
              ) : (
                <>
                  <View className="flex-row items-center mb-2">
                    <User size={16} className="text-muted-foreground mr-1" />
                    <Text className="font-semibold">{profile.name}</Text>
                    {profile.relationship === 'friend' && <Badge className="ml-2">Friend</Badge>}
                  </View>

                  <View className="flex-row items-center mb-4">
                    <AtSign size={14} className="text-muted-foreground mr-1" />
                    <Text className="text-muted-foreground">{profile.username}</Text>
                  </View>

                  <View className="flex-row items-center mb-4">
                    <MapPin size={14} className="text-muted-foreground mr-1" />
                    <Text className="text-muted-foreground">{profile.location}</Text>
                  </View>

                  {isSelfProfile ? (
                    <StatusUpdate
                      userId={user?.id || ''}
                      currentStatus={profile.status_message || ''}
                      lastUpdate={profile.last_status_update || ''}
                      onStatusUpdated={fetchUserProfile}
                    />
                  ) : profile.status_message ? (
                    <View className="mt-4 p-4 bg-muted rounded-lg">
                      <Text className="text-sm italic text-foreground">{profile.status_message}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            <View className="flex-row justify-around w-full mb-4">
              <View className="items-center">
                <Text className="text-lg font-semibold">{profile.followerCount}</Text>
                <Text className="text-sm text-muted-foreground">Followers</Text>
              </View>

              <View className="items-center">
                <Text className="text-lg font-semibold">{profile.followingCount}</Text>
                <Text className="text-sm text-muted-foreground">Following</Text>
              </View>
            </View>

            <View className="flex-row w-full space-x-2">
              {!profile.isSelf && (
                <Button
                  variant={profile.isFollowing ? 'secondary' : 'default'}
                  className="flex-1"
                  onPress={toggleFollow}
                >
                  {profile.isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}

              <Button
                variant="outline"
                className="flex-1"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/direct-message/[id]',
                    params: {
                      id: profile.id,
                      username: profile.username,
                    },
                  })
                }
              >
                <MessageSquare size={16} className="text-foreground mr-1" />
                <Text>Message</Text>
              </Button>
            </View>
          </Card>

          {/* Gallery Section */}
          <Card className="p-4 mb-6 border border-border">
            <>
              <View className="items-center p-4">
                <Text className="text-lg font-semibold">Gallery</Text>
              </View>

              {/* Gallery View */}
              <GalleryView
                images={galleryImages}
                userId={user?.id || ''}
                isOwner={isSelfProfile}
                onImageAdded={() => {}}
                onImageDeleted={() => {}}
              />
            </>
          </Card>

          {profile && !isSelfProfile && user?.id && (
            <RelationshipActions
              userId={user.id}
              targetId={profile.id}
              relationshipType={profile.relationship}
              onRelationshipChange={fetchUserProfile}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}
