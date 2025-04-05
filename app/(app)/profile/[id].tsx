import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { useColorScheme } from '~/lib/useColorScheme';
import { ArrowLeft, User, MapPin, Calendar, MessageSquare, Edit2, Camera, AtSign } from 'lucide-react-native';

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

const mockUserProfile = (userId: string, username?: string, isSelf = false): UserProfile => {
  // Create different mock profiles based on userId or generate a profile for the current user
  if (isSelf) {
    return {
      id: userId,
      username: username || 'uzzap_user',
      name: 'UzZap User',
      bio: 'This is your personal profile. Edit your details and share more about yourself!',
      location: 'Manila, Philippines',
      avatar: null,
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // Joined 30 days ago
      followerCount: 24,
      followingCount: 56,
      isSelf: true,
      isFollowing: false
    };
  }

  // For other profiles, provide mock data
  const mockProfiles: Record<string, Partial<UserProfile>> = {
    'default': {
      name: username || 'UzZap User',
      bio: 'Hello! I love connecting with people from all regions of the Philippines!',
      location: 'Manila, NCR',
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // Joined 45 days ago
      followerCount: 28,
      followingCount: 42,
      isFollowing: false
    },
    '1': {
      name: 'Maria Santos',
      bio: 'Travel enthusiast | Food lover | Exploring the beautiful Philippines one province at a time',
      location: 'Manila, NCR',
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // Joined 60 days ago
      followerCount: 125,
      followingCount: 89,
      isFollowing: true
    },
    '2': {
      name: 'Juan Dela Cruz',
      bio: 'Software developer from Cebu. Passionate about tech and connecting local communities.',
      location: 'Cebu City, Cebu',
      joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // Joined 90 days ago
      followerCount: 86,
      followingCount: 104,
      isFollowing: true
    }
  };

  const profile = mockProfiles[userId] || mockProfiles['default'];
  
  return {
    id: userId,
    username: username || `user_${userId}`,
    name: profile.name || username || 'User',
    bio: profile.bio || 'No bio yet',
    location: profile.location || 'Philippines',
    avatar: null,
    joinDate: profile.joinDate || new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    followerCount: profile.followerCount || 0,
    followingCount: profile.followingCount || 0,
    isSelf: false,
    isFollowing: profile.isFollowing || false
  };
};

export default function ProfileScreen() {
  const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
  const { user } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  // Determine if this is the current user's profile
  const isSelfProfile = id === user?.id || id === 'me';
  
  useEffect(() => {
    // Load mock profile
    const userProfile = mockUserProfile(
      id || 'default', 
      username || undefined, 
      isSelfProfile
    );
    setProfile(userProfile);
    setEditedProfile({
      name: userProfile.name,
      username: userProfile.username,
      bio: userProfile.bio,
      location: userProfile.location
    });
  }, [id, username, isSelfProfile]);
  
  const toggleFollow = () => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      isFollowing: !profile.isFollowing,
      followerCount: profile.isFollowing 
        ? profile.followerCount - 1 
        : profile.followerCount + 1
    });
  };
  
  const saveProfile = () => {
    if (!profile) return;
    
    // Validate fields (basic validation)
    if (!editedProfile.name?.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (!editedProfile.username?.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    
    // Update profile
    setProfile({
      ...profile,
      ...editedProfile
    });
    
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };
  
  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  if (!profile) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text>Loading profile...</Text>
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
