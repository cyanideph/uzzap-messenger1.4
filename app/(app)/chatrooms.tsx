import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, FlatList, Platform, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Search } from '~/lib/icons/Search';
import { MapPin } from '~/lib/icons/MapPin';
import { Users } from '~/lib/icons/Users';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { MessageSquare } from '~/lib/icons/MessageSquare';
import { router } from 'expo-router';
import { supabase } from '~/lib/supabase';
// import * as Slot from '@rn-primitives/slot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import { PortalHost } from '@rn-primitives/portal';

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
        .select('province_id, is_online')
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRegionsAndProvinces();
  };

  const toggleRegion = (regionId: string) => {
    console.log('toggleRegion called with regionId:', regionId);
    setExpandedRegion(expandedRegion === regionId ? null : regionId);
  };

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

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4" style={{ paddingBottom: insets.bottom }}>
          <Text className="text-2xl font-bold mb-2">Chatrooms</Text>
          <Text className="text-muted-foreground mb-4">
            Join conversations in Philippines regions and provinces
          </Text>
          
          {/* Search */}
          <View className="flex-row items-center bg-muted rounded-lg px-3 mb-6">
            <Search size={18} className="text-muted-foreground" />
            <Input
              placeholder="Search regions or provinces..."
              className="flex-1 h-12 border-0 bg-transparent"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Loading State */}
          {loading ? (
            <View className="items-center py-8">
              <Text className="text-muted-foreground">Loading regions...</Text>
            </View>
          ) : filteredRegions.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-muted-foreground">
                No regions or provinces found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            // Regions List
            <View className="space-y-4">
              {filteredRegions.map(region => {
                return (
                  <RegionItem
                    key={region.id}
                    region={region}
                    expandedRegion={expandedRegion}
                    toggleRegion={toggleRegion}
                    navigateToChatroom={navigateToChatroom}
                    activeUsers={activeUsers}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <WindowOverlay>
        <PortalHost name={CHATROOMS_PORTAL_HOST_NAME} />
      </WindowOverlay>
    </View>
  );
}

function RegionItem({ region, expandedRegion, toggleRegion, navigateToChatroom, activeUsers }: {
  region: Region;
  expandedRegion: string | null;
  toggleRegion: (regionId: string) => void;
  navigateToChatroom: (provinceId: string, provinceName: string, regionName: string) => void;
  activeUsers: Record<string, number>;
}) {
  const memoizedRegion = React.useMemo(() => region, [region]);

  return (
    <Card key={memoizedRegion.id} className="border border-border overflow-hidden">
      {/* Region Header */}
      <Pressable
        className="flex-row items-center justify-between p-4"
        onPress={() => {
          console.log('Region header pressed for regionId:', memoizedRegion.id);
          toggleRegion(memoizedRegion.id);
        }}
      >
        <View className="flex-row items-center flex-1 justify-between">
          <View className="flex-row items-center flex-1">
            <MapPin size={18} className="text-primary mr-2" />
            <View className="flex-1">
              <Text className="font-semibold">{memoizedRegion.name}</Text>
              <Text className="text-sm text-muted-foreground">
                {memoizedRegion.provinces.length} {memoizedRegion.provinces.length === 1 ? 'Province' : 'Provinces'}
              </Text>
            </View>
          </View>
          <ChevronRight
            size={18}
            className={`text-muted-foreground ${
              String(expandedRegion) === String(memoizedRegion.id) ? 'rotate-90' : ''
            }`}
          />
        </View>
      </Pressable>

      {/* Provinces List */}
      {String(expandedRegion) === String(memoizedRegion.id) && (
        <View className="border-t border-border">
          {memoizedRegion.provinces.map(province => (
            <Pressable
              key={province.id}
              className="flex-row items-center justify-between p-4 border-b border-border last:border-b-0"
              onPress={() => navigateToChatroom(province.id, province.name, memoizedRegion.name)}
            >
              <View className="flex-1 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text>{province.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Users size={14} className="text-muted-foreground mr-1" />
                    <Text className="text-sm text-muted-foreground">
                      {activeUsers[province.id] || 0} active
                    </Text>
                  </View>
                </View>
                <MessageSquare size={18} className="text-primary" />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}
