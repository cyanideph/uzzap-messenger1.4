import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { useColorScheme } from '~/lib/useColorScheme';
import { ArrowLeft, User, MapPin, Calendar, MessageSquare, Edit2, Camera, AtSign, MoreVertical } from 'lucide-react-native';
import { supabase, uploadAvatar, getGalleryImages } from '~/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { GalleryView } from '~/components/gallery/GalleryView';
import { StatusUpdate } from '~/components/status/StatusUpdate';
import { RelationshipActions } from '~/components/relationships/RelationshipActions';
import { Avatar } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  location: string;
  avatar: string | null;
  joinDate: Date;
  isSelf: boolean;
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
  const scrollY = new Animated.Value(0);

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

      // First, fetch the profile data with follower/following counts
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          bio,
          avatar_url,
          created_at,
          status_message,
          last_status_update,
          user_relationships!user_relationships_related_user_id_fkey(relationship_type)
        `)
        .eq('id', profileId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      // Then fetch the user's location separately
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('location')
        .eq('id', profileId)
        .single();

      if (userError) {
        console.error('Error fetching user location:', userError);
      }

      // Create user profile object
      const userProfile: UserProfile = {
        id: profileData.id,
        username: profileData.username,
        name: profileData.full_name || profileData.username,
        bio: profileData.bio || '',
        location: userData?.location || 'Unknown',
        avatar: profileData.avatar_url,
        joinDate: new Date(profileData.created_at),
        isSelf: isSelfProfile,
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

  const formatJoinDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const renderHeader = () => (
    <View className="relative">
      <View className="h-48 bg-primary/20" />
      <View className="absolute -bottom-16 left-4">
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <View className="relative">
            <Avatar
              src={profile?.avatar || undefined}
              alt={profile?.name || 'User'}
              size="lg"
              fallback={(profile?.name?.[0] || '?').toUpperCase()}
              className="w-32 h-32 border-4 border-background"
            />
            {isSelfProfile && (
              <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
                <Camera className="text-primary-foreground" size={16} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      {isSelfProfile && (
        <View className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="text-foreground" size={24} />
          </Button>
        </View>
      )}
    </View>
  );

  const renderProfileInfo = () => (
    <View className="px-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center space-x-3">
          <Avatar
            src={profile?.avatar || undefined}
            alt={profile?.name || 'User'}
            size="lg"
            fallback={(profile?.name?.[0] || '?').toUpperCase()}
          />
          <View>
            <Text className="text-xl font-bold">{profile?.name}</Text>
            <View className="flex-row items-center space-x-1">
              <AtSign size={14} className="text-muted-foreground" />
              <Text className="text-muted-foreground">@{profile?.username}</Text>
            </View>
          </View>
        </View>
        {isSelfProfile ? (
          <Button
            variant="outline"
            size="sm"
            className="p-2"
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit2 size={20} className="text-primary" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="p-2"
            onPress={() => router.push(`/direct-message/${profile?.id}`)}
          >
            <MessageSquare size={20} className="text-primary" />
          </Button>
        )}
      </View>

      {profile?.bio && (
        <Text className="text-base mb-4">{profile.bio}</Text>
      )}

      <View className="flex-row items-center space-x-4 mb-4">
        {profile?.location && (
          <View className="flex-row items-center">
            <MapPin className="text-muted-foreground mr-1" size={16} />
            <Text className="text-muted-foreground">{profile.location}</Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Calendar className="text-muted-foreground mr-1" size={16} />
          <Text className="text-muted-foreground">
            Joined {formatJoinDate(profile?.joinDate)}
          </Text>
        </View>
      </View>

      {profile?.status_message && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text className="text-base">{profile.status_message}</Text>
            {profile.last_status_update && (
              <Text className="text-sm text-muted-foreground mt-1">
                Updated {profile.last_status_update}
              </Text>
            )}
          </CardContent>
        </Card>
      )}
    </View>
  );

  const renderGallery = () => (
    <View className="mt-6">
      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text className="text-lg font-semibold">Gallery</Text>
        {isSelfProfile && (
          <Button
            variant="outline"
            size="sm"
            className="p-2"
            onPress={() => router.push('/gallery')}
          >
            <Camera size={20} className="text-primary" />
          </Button>
        )}
      </View>
      <GalleryView
        userId={profile?.id || ''}
        isOwner={isSelfProfile}
        images={galleryImages}
        onImageAdded={() => fetchGalleryImages()}
        onImageDeleted={() => fetchGalleryImages()}
      />
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onPress={() => router.back()}
            >
              <ArrowLeft className="text-foreground" size={24} />
            </Button>
          ),
        }}
      />
      <ScrollView
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderProfileInfo()}
        {renderGallery()}
      </ScrollView>
    </View>
  );
}
