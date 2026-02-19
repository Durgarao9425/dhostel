import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Image, FlatList, Dimensions } from 'react-native';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Bed, Users, IndianRupee, MapPin, CheckCircle2, Phone, Mail, Edit3, User } from 'lucide-react-native';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const RoomDetailsScreen = ({ route }: any) => {
    const { roomId } = route.params;
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState<any>(null);

    useEffect(() => {
        fetchRoomDetails();
    }, [roomId]);

    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/rooms/${roomId}`);
            if (response.data.success) {
                setRoom(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching room details:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderOccupant = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.occupantCard}
            onPress={() => navigation.navigate('StudentDetails', { studentId: item.student_id })}
        >
            <View style={styles.occupantHeader}>
                {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.occupantAvatar} />
                ) : (
                    <View style={styles.occupantAvatarPlaceholder}>
                        <User size={24} color="#FF6B6B" />
                    </View>
                )}
                <View style={styles.occupantInfo}>
                    <Text style={styles.occupantName}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.occupantPhone}>{item.phone || 'No phone'}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.occupantCallBtn}
                onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}
            >
                <Phone size={14} color="#4CAF50" />
                <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    if (!room) {
        return (
            <View style={styles.center}>
                <Text>Room not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title={`Room ${room.room_number}`}
                rightElement={
                    <TouchableOpacity onPress={() => navigation.navigate('AddRoom', { room: room, isEdit: true })}>
                        <Edit3 color="#FFF" size={24} />
                    </TouchableOpacity>
                }
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.roomSummary}>
                    <View style={styles.roomTypeHeader}>
                        <Bed color="#FF6B6B" size={24} />
                        <Text style={styles.roomTypeText}>{room.room_type_name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: room.available_beds > 0 ? '#E8F5E9' : '#FFE5E5' }]}>
                            <Text style={[styles.statusText, { color: room.available_beds > 0 ? '#4CAF50' : '#FF6B6B' }]}>
                                {room.available_beds > 0 ? 'Available' : 'Full'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Monthly Rent</Text>
                            <View style={styles.statValueRow}>
                                <IndianRupee size={16} color="#1A1A1A" />
                                <Text style={styles.statValue}>{room.rent_per_bed}</Text>
                            </View>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Floor</Text>
                            <Text style={styles.statValue}>{room.floor_number || 'N/A'}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Beds</Text>
                            <Text style={styles.statValue}>{room.occupied_beds}/{room.total_capacity}</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesGrid}>
                        {room.amenities && room.amenities.map((item: any, index: number) => (
                            <View key={index} style={styles.amenityItem}>
                                <CheckCircle2 size={16} color="#4CAF50" />
                                <Text style={styles.amenityName}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Occupants ({room.occupied_beds})</Text>
                    {!room.occupants || room.occupants.length === 0 ? (
                        <Card style={styles.noStudentsCard}>
                            <Users size={32} color="#CBD5E1" />
                            <Text style={styles.noStudents}>Room is empty</Text>
                        </Card>
                    ) : (
                        <FlatList
                            data={room.occupants}
                            renderItem={renderOccupant}
                            keyExtractor={item => item.student_id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.occupantList}
                            snapToInterval={width * 0.7 + 16}
                            decelerationRate="fast"
                        />
                    )}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 20 },
    roomSummary: { padding: 20, marginBottom: 20 },
    roomTypeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    roomTypeText: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginLeft: 12, flex: 1 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
    statValueRow: { flexDirection: 'row', alignItems: 'center' },
    statValue: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1A202C', marginBottom: 16 },
    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    amenityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    amenityName: { fontSize: 13, color: '#4A5568', marginLeft: 8, fontWeight: '500' },
    occupantList: { paddingRight: 20 },
    occupantCard: { width: width * 0.7, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginRight: 16, borderWidth: 1, borderColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
    occupantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    occupantAvatar: { width: 50, height: 50, borderRadius: 25 },
    occupantAvatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center' },
    occupantInfo: { marginLeft: 12 },
    occupantName: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
    occupantPhone: { fontSize: 13, color: '#718096', marginTop: 2 },
    occupantCallBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FFF4', paddingVertical: 10, borderRadius: 12, gap: 8 },
    callText: { fontSize: 13, fontWeight: '700', color: '#48BB78' },
    noStudentsCard: { padding: 30, alignItems: 'center', justifyContent: 'center', gap: 10 },
    noStudents: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
    bottomSpacing: { height: 40 },
});

export default RoomDetailsScreen;
