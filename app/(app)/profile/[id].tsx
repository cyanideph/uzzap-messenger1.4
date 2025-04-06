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
import { supabase } from '~/lib/supabase';

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
  
  // Determine if this is the current user's profile
  const isSelfProfile = id === user?.id || id === 'me';
  
  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Determine the actual user ID to fetch
      const profileId = (isSelfProfile && user) ? user.id : id;
      
      if (!profileId) {
        console.error('No profile ID available');
        setLoading(false);
        return;
      }
      
      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, created_at')
        .eq('id', profileId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }
      
      // Fetch user location
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('location')
        .eq('id', profileId)
        .single();
      
      if (userError) {
        console.error('Error fetching user location:', userError);
      }
      
      // Fetch follower and following counts
      const { count: followerCount, error: followerError } = await supabase
        .from('user_follows')
        .select('follower_id', { count: 'exact' })
        .eq('following_id', profileId);
      
      if (followerError) {
        console.error('Error fetching follower count:', followerError);
      }
      
      const { count: followingCount, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id', { count: 'exact' })
        .eq('follower_id', profileId);
      
      if (followingError) {
        console.error('Error fetching following count:', followingError);
      }
      
      // Check if current user is following this profile
      let isFollowing = false;
      if (!isSelfProfile && user?.id) {
        const { data: followData, error: followError } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileId)
          .single();
        
        isFollowing = !!followData;
      }
      
      // Create user profile object
      const userProfile: UserProfile = {
        id: profileData.id,
        username: profileData.username,
        name: profileData.full_name || profileData.username,
        bio: profileData.bio || '',
        location: userData?.location || 'Philippines',
        avatar: profileData.avatar_url,
        joinDate: new Date(profileData.created_at),
        followerCount: followerCount || 0,
        followingCount: followingCount || 0,
        isSelf: isSelfProfile,
        isFollowing: isFollowing
      };
      
      setProfile(userProfile);
      setEditedProfile({
        name: userProfile.name,
        username: userProfile.username,
        bio: userProfile.bio,
        location: userProfile.location
      });
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserProfile();
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
            created_at: new Date().toISOString()
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
          : profile.followerCount + 1
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
          bio: editedProfile.bio
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
        ...editedProfile
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
      year: 'numeric'
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
                      { text: 'Discard', onPress: () => {
                        setIsEditing(false);
                        // Reset edited profile
                        setEditedProfile({
                          name: profile.name,
                          username: profile.username,
                          bio: profile.bio,
                          location: profile.location
                        });
                      }}
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
                    onPress={() => Alert.alert('Upload Photo', 'Photo upload feature coming soon!')}
                  >
                    {profile.avatar ? (
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
                    onChangeText={(text) => setEditedProfile({...editedProfile, name: text})}
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
                    onChangeText={(text) => setEditedProfile({...editedProfile, username: text})}
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
                    onChangeText={(text) => setEditedProfile({...editedProfile, location: text})}
                    placeholder="Your location"
                    placeholderTextColor="#9ca3af"
                  />
                  
                  <Text className="font-medium mb-1">Bio</Text>
                  <TextInput
                    className="w-full bg-muted rounded-lg p-2 mb-3 text-foreground"
                    value={editedProfile.bio}
                    onChangeText={(text) => setEditedProfile({...editedProfile, bio: text})}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  
                  <Button 
                    className="mt-2" 
                    onPress={saveProfile}
                  >
                    Save Profile
                  </Button>
                </View>
              ) : (
                <>
                  <Text className="text-xl font-bold">{profile.name}</Text>
                  <Text className="text-muted-foreground mb-2">@{profile.username}</Text>
                  
                  <View className="flex-row items-center mb-2">
                    <MapPin size={14} className="text-muted-foreground mr-1" />
                    <Text className="text-sm text-muted-foreground">{profile.location}</Text>
                  </View>
                  
                  <View className="flex-row items-center mb-4">
                    <Calendar size={14} className="text-muted-foreground mr-1" />
                    <Text className="text-sm text-muted-foreground">
                      Joined {formatJoinDate(profile.joinDate)}
                    </Text>
                  </View>
                  
                  <Text className="text-center text-foreground mb-4">
                    {profile.bio}
                  </Text>
                  
                  <View className="flex-row justify-around w-full mb-4">
                    <View className="items-center">
                      <Text className="text-lg font-bold">{profile.followerCount}</Text>
                      <Text className="text-muted-foreground">Followers</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold">{profile.followingCount}</Text>
                      <Text className="text-muted-foreground">Following</Text>
                    </View>
                  </View>
                  
                  {!profile.isSelf && (
                    <View className="flex-row w-full space-x-2">
                      <Button 
                        variant={profile.isFollowing ? "outline" : "default"}
                        className="flex-1"
                        onPress={toggleFollow}
                      >
                        <Text className={profile.isFollowing ? "text-foreground" : "text-primary-foreground"}>
                          {profile.isFollowing ? 'Following' : 'Follow'}
                        </Text>
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onPress={() => router.push({
                          pathname: "/direct-message/[id]",
                          params: { id: profile.id, username: profile.username }
                        })}
                      >
                        <MessageSquare size={16} className="text-foreground mr-1" />
                        <Text>Message</Text>
                      </Button>
                    </View>
                  )}
                </>
              )}
            </View>
          </Card>
          
          {/* Recent Activity */}
          {!isEditing && (
            <>
              <Text className="text-lg font-semibold mb-3">Recent Activity</Text>
              <Card className="p-4 mb-6 border border-border">
                <View className="items-center p-4">
                  <User size={40} className="text-muted-foreground mb-2" />
                  <Text className="text-center text-muted-foreground">
                    No recent activity to show
                  </Text>
                  <Text className="text-center text-xs text-muted-foreground mt-1">
                    Activity feature coming soon!
                  </Text>
                </View>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}
