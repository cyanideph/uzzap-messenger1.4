import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, FlatList, Platform, Pressable, Animated } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Search, MapPin, Users, ChevronRight, MessageSquare, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { PortalHost } from '@rn-primitives/portal';
import { cn } from '~/lib/utils';

interface Province {
  id: string;
  name: string;
  region_id: string;
}

interface Region {
  id: string;
  name: string;
  provinces: Province[];
}

// No mock data - we'll use Supabase database only

const CHATROOMS_PORTAL_HOST_NAME = 'chatrooms-screen';

const WindowOverlay = Platform.OS === 'ios' ? FullWindowOverlay : React.Fragment;

export default function ChatroomsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchRegionsAndProvinces = async () => {
    try {
      // Fetch regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (regionsError) {
        console.error('Error fetching regions:', regionsError);
        return;
      }

      if (!regionsData || regionsData.length === 0) {
        console.warn('No regions found in the database');
        setRegions([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch provinces
      const { data: provincesData, error: provincesError } = await supabase
        .from('provinces')
        .select('*')
        .order('name');

      if (provincesError) {
        console.error('Error fetching provinces:', provincesError);
        return;
      }

      // Fetch active users count for each province
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('users')
        .select('id, province_id, is_online')
        .eq('is_online', true);

      if (activeUsersError) {
        console.error('Error fetching active users:', activeUsersError);
      }

      // Count active users per province
      const activeUsers: Record<string, number> = {};
      activeUsersData?.forEach(user => {
        if (user.province_id) {
          activeUsers[user.province_id] = (activeUsers[user.province_id] || 0) + 1;
        }
      });

      // Organize provinces by region
      const regionsWithProvinces = regionsData.map(region => ({
        ...region,
        provinces: provincesData?.filter(province => province.region_id === region.id) || []
      }));

      setRegions(regionsWithProvinces);
      setActiveUsers(activeUsers);
    } catch (error) {
      console.error('Unexpected error:', error);
      setRegions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegionsAndProvinces();
  }, []);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRegionsAndProvinces();
  }, []);

  const toggleRegion = React.useCallback((regionId: string) => {
    console.log('toggleRegion called with regionId:', regionId);
    setExpandedRegion(expandedRegion === regionId ? null : regionId);
  }, [expandedRegion]);

  const filteredRegions = regions.filter(region => {
    const matchesRegion = region.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = region.provinces.some(province => 
      province.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesRegion || matchesProvince;
  });

  const navigateToChatroom = (provinceId: string, provinceName: string, regionName: string) => {
    router.push({
      pathname: "/chatroom/[id]",
      params: { 
        id: provinceId,
        provinceName: provinceName,
        regionName: regionName 
      }
    });
  };

  const renderSearchBar = () => (
    <View className="px-4 py-4">
      <View className="flex-row items-center space-x-2">
        <View className="flex-1 relative">
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search className="text-muted-foreground" size={20} />
          </View>
          <Input
            placeholder="Search chatrooms..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-background pl-10"
          />
        </View>
        <Button
          variant="outline"
          size="sm"
          className="p-2"
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter className="text-foreground" size={20} />
        </Button>
      </View>
    </View>
  );

  const renderRegionItem = ({ item: region }: { item: Region }) => {
    const isExpanded = expandedRegion === region.id;
    const rotateAnim = new Animated.Value(isExpanded ? 1 : 0);
    
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
    });

    return (
      <Card className="mx-4 mb-4 overflow-hidden">
        <Pressable
          onPress={() => setExpandedRegion(isExpanded ? null : region.id)}
          className="p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <MapPin className="text-primary" size={20} />
              <Text className="text-lg font-semibold">{region.name}</Text>
            </View>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <ChevronRight className="text-muted-foreground" size={20} />
            </Animated.View>
          </View>
        </Pressable>

        {isExpanded && (
          <View className="px-4 pb-4">
            {region.provinces.map((province) => (
              <Pressable
                key={province.id}
                onPress={() => navigateToChatroom(province.id, province.name, region.name)}
                className="mb-2 last:mb-0"
              >
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center space-x-3">
                        <MessageSquare className="text-primary" size={18} />
                        <View>
                          <Text className="font-medium">{province.name}</Text>
                          <Text className="text-sm text-muted-foreground">
                            {activeUsers[province.id] || 0} active users
                          </Text>
                        </View>
                      </View>
                      <Badge variant="secondary">
                        {activeUsers[province.id] || 0}
                      </Badge>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading chatrooms...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <PortalHost name={CHATROOMS_PORTAL_HOST_NAME} />
      <WindowOverlay>
        <View style={{ paddingTop: insets.top }} className="flex-1">
          {renderSearchBar()}
          <FlatList
            data={regions}
            renderItem={renderRegionItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </WindowOverlay>
    </View>
  );
}
