import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    LayoutAnimation,
    Platform,
    UIManager,
    SectionList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bed, Plus, Search, X, Info } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../services/api';
import { HeaderNotification } from '../components/HeaderNotification';
import { ProfileMenu } from '../components/ProfileMenu';
import { useTheme } from '../../contexts/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export const RoomsScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await api.get('/rooms?limit=100');
            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchRooms);
        return unsubscribe;
    }, [navigation]);

    // Update activeTab if passed via params
    useEffect(() => {
        if (route.params?.filter) {
            setActiveTab(route.params.filter);
            // reset params to avoid stuck state
            navigation.setParams({ filter: undefined });
        }
    }, [route.params]);

    // Grouping logic for Floor-wise display
    const getGroupedData = () => {
        const filtered = rooms.filter(room => {
            const matchesSearch = room.room_number?.toString().includes(search) ||
                room.room_type_name?.toLowerCase().includes(search.toLowerCase());

            if (activeTab === 'Vacant') return matchesSearch && room.available_beds > 0;
            if (activeTab === 'Full') return matchesSearch && room.available_beds === 0;
            return matchesSearch;
        });

        const groups: any = {};
        filtered.forEach(room => {
            const floor = `Floor ${room.floor_number || 'N/A'}`;
            if (!groups[floor]) groups[floor] = [];
            groups[floor].push(room);
        });

        return Object.keys(groups).sort().map(floor => ({
            title: floor,
            data: [groups[floor]] // Wrap in array for custom row rendering
        }));
    };

    const renderRoomItem = (room: any) => {
        const isFull = room.available_beds === 0;
        const isVacant = room.occupied_beds === 0;

        let statusColor = '#EAB308'; // Partial (Yellow)
        if (isFull) statusColor = '#EF4444'; // Full (Red)
        if (isVacant) statusColor = '#22C55E'; // Empty (Green)

        return (
            <TouchableOpacity
                key={room.room_id}
                style={[styles.roomBox, { borderColor: statusColor }]}
                onPress={() => navigation.navigate('RoomDetails', { roomId: room.room_id })}
            >
                <View style={[styles.statusTag, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusTagText}>
                        {isFull ? 'FULL' : `${room.available_beds} LEFT`}
                    </Text>
                </View>
                <Text style={styles.roomLabel}>RM</Text>
                <Text style={styles.roomNum}>{room.room_number}</Text>
                <View style={styles.capacityBar}>
                    <Text style={styles.capacityText}>{room.occupied_beds}/{room.total_capacity}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Room Status</Text>
                        <Text style={styles.headerSubtitle}>{rooms.length} Total Units</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <HeaderNotification navigation={navigation} />
                        <ProfileMenu />
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Search color="#94A3B8" size={18} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search room number..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <View style={styles.tabBar}>
                    {[
                        { key: 'All', count: rooms.length },
                        { key: 'Vacant', count: rooms.filter(r => r.available_beds > 0).length },
                        { key: 'Full', count: rooms.filter(r => r.available_beds === 0).length }
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => {
                                LayoutAnimation.easeInEaseOut();
                                setActiveTab(tab.key);
                            }}
                            style={[styles.tabItem, activeTab === tab.key && styles.activeTab]}
                        >
                            <Text style={[styles.tabLabelText, activeTab === tab.key ? { color: theme.primary } : { color: '#FFF' }]}>
                                {tab.key} ({tab.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <SectionList
                    sections={getGroupedData()}
                    keyExtractor={(item, index) => index.toString()}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={styles.listContent}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.floorHeader}>{title}</Text>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.gridRow}>
                            {item.map((room: any) => renderRoomItem(room))}
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('AddRoom')}
            >
                <Plus color="#FFF" size={30} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    headerActions: { flexDirection: 'row', gap: 12 },
    searchContainer: { backgroundColor: '#FFF', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 46, marginBottom: 15 },
    searchInput: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#1E293B' },
    tabBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', padding: 4, borderRadius: 14 },
    tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#FFF' },
    tabLabelText: { fontSize: 12, fontWeight: '800' },
    listContent: { padding: 16, paddingBottom: 120 },
    floorHeader: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 12, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
    gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    roomBox: {
        width: ITEM_WIDTH,
        height: 110,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        paddingTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    statusTag: { position: 'absolute', top: -1, left: -1, right: -1, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingVertical: 2, alignItems: 'center' },
    statusTagText: { fontSize: 8, fontWeight: '900', color: '#FFF' },
    roomLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
    roomNum: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
    capacityBar: { marginTop: 5, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    capacityText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
    fab: { position: 'absolute', bottom: 130, right: 20, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});

export default RoomsScreen;