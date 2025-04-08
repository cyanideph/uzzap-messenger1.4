import React from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Plus, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadGalleryImage, deleteGalleryImage } from '~/lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

interface GalleryViewProps {
  userId: string;
  images: GalleryImage[];
  isOwner: boolean;
  onImageAdded: () => void;
  onImageDeleted: () => void;
}

export function GalleryView({ userId, images, isOwner, onImageAdded, onImageDeleted }: GalleryViewProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const { uri } = result.assets[0];
      const response = await fetch(uri);
      const blob = await response.blob();
      
      await uploadGalleryImage(userId, blob as File);
      onImageAdded();
    }
  };

  const handleDelete = async (imageId: string) => {
    await deleteGalleryImage(imageId);
    onImageDeleted();
  };

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Gallery</Text>
        {isOwner && (
          <Button variant="outline" size="sm" onPress={pickImage}>
            <Plus size={16} className="mr-1" />
            <Text>Add Photo</Text>
          </Button>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-4">
          {images.map((image) => (
            <View key={image.id} className="relative">
              <Image
                source={{ uri: image.image_url }}
                className="w-32 h-32 rounded-lg"
              />
              {image.caption && (
                <Text className="text-xs text-muted-foreground mt-1">
                  {image.caption}
                </Text>
              )}
              {isOwner && (
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                  onPress={() => handleDelete(image.id)}
                >
                  <Trash2 size={16} className="text-destructive" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
