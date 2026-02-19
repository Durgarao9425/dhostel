import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { Header } from '../components/Header';
import { InputField } from '../components/InputField';
import { Card } from '../components/Card';
import api from '../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Check, ChevronDown, Layers, LayoutGrid } from 'lucide-react-native';
import { Modal, FlatList } from 'react-native';

export const AddRoomScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const isEdit = route?.params?.isEdit || false;
    const roomToEdit = route?.params?.room || null;
    const [loading, setLoading] = useState(false);
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [amenitiesList, setAmenitiesList] = useState<any[]>([]);
    const [hostelData, setHostelData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});


    const [typeModalVisible, setTypeModalVisible] = useState(false);

    const initialFormState = {
        room_number: roomToEdit?.room_number?.toString() || '',
        floor_number: roomToEdit?.floor_number?.toString() || '0',
        room_type_id: roomToEdit?.room_type_id?.toString() || '',
        capacity: roomToEdit?.total_capacity?.toString() || '',
        rent_per_bed: roomToEdit?.rent_per_bed?.toString() || '',
        occupied_beds: roomToEdit?.occupied_beds?.toString() || '0',
        selectedAmenities: roomToEdit?.amenities || [] as string[],
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchRoomTypes();
        fetchAmenities();
        fetchHostelDetails();
    }, []);

    const fetchHostelDetails = async () => {
        if (!user?.hostel_id) return;
        try {
            const response = await api.get(`/hostels/${user.hostel_id}`);
            if (response.data.success) {
                setHostelData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching hostel details:', error);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const response = await api.get('/rooms/types');
            if (response.data.success) {
                setRoomTypes(response.data.data);
                if (!isEdit && response.data.data.length > 0 && !formData.room_type_id) {
                    setFormData(prev => ({ ...prev, room_type_id: response.data.data[0].room_type_id.toString() }));
                }
            }
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    const fetchAmenities = async () => {
        try {
            const response = await api.get('/amenities/rooms');
            if (response.data.success) {
                setAmenitiesList(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching amenities:', error);
            setAmenitiesList([
                { amenity_name: 'WiFi' },
                { amenity_name: 'AC' },
                { amenity_name: 'Attached Bathroom' },
            ]);
        }
    };

    const toggleAmenity = (name: string) => {
        setFormData(prev => {
            const exists = prev.selectedAmenities.includes(name);
            if (exists) {
                return { ...prev, selectedAmenities: prev.selectedAmenities.filter((a: string) => a !== name) };
            } else {
                return { ...prev, selectedAmenities: [...prev.selectedAmenities, name] };
            }
        });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.room_number) newErrors.room_number = 'Room number is required';
        if (!formData.floor_number) newErrors.floor_number = 'Floor number is required';
        if (!formData.capacity) newErrors.capacity = 'Capacity is required';
        if (!formData.rent_per_bed) newErrors.rent_per_bed = 'Rent is required';
        if (!formData.room_type_id) newErrors.room_type_id = 'Room type is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleReset = () => {
        setFormData({
            ...initialFormState,
            room_type_id: roomTypes.length > 0 ? roomTypes[0].room_type_id.toString() : '',
        });
        setErrors({});
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                hostel_id: user?.hostel_id,
                room_number: formData.room_number,
                room_type_id: parseInt(formData.room_type_id),
                floor_number: parseInt(formData.floor_number),
                capacity: parseInt(formData.capacity),
                rent_per_bed: parseFloat(formData.rent_per_bed),
                occupied_beds: parseInt(formData.occupied_beds),
                amenities: formData.selectedAmenities,
            };

            const response = isEdit
                ? await api.put(`/rooms/${roomToEdit.room_id}`, payload)
                : await api.post('/rooms', payload);

            if (response.status === 201 || response.status === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `Room ${isEdit ? 'updated' : 'added'} successfully!`,
                });
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Error saving room:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.error || 'Failed to save room',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <Header title={isEdit ? "Edit Room" : "Add New Room"} />
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
            >
                <Card style={styles.formCard}>
                    <InputField
                        label="Room Number *"
                        placeholder="e.g. 101"
                        value={formData.room_number}
                        error={errors.room_number}
                        onChangeText={(text) => {
                            const newFormData = { ...formData, room_number: text };
                            setFormData(newFormData);
                            if (errors.room_number) {
                                const newErrors = { ...errors };
                                delete newErrors.room_number;
                                setErrors(newErrors);
                            }
                        }}
                    />

                    <InputField
                        label="Floor Number *"
                        placeholder="Enter Floor Number"
                        keyboardType="numeric"
                        value={formData.floor_number}
                        error={errors.floor_number}
                        onChangeText={(text) => {
                            const newFormData = { ...formData, floor_number: text };
                            setFormData(newFormData);
                            if (errors.floor_number) {
                                const newErrors = { ...errors };
                                delete newErrors.floor_number;
                                setErrors(newErrors);
                            }
                        }}
                    />

                    <View style={{ height: 20 }} />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField
                                label="Total Capacity *"
                                placeholder="Total Beds"
                                keyboardType="numeric"
                                value={formData.capacity}
                                error={errors.capacity}
                                onChangeText={(text) => {
                                    const newFormData = { ...formData, capacity: text };
                                    setFormData(newFormData);
                                    if (errors.capacity) {
                                        const newErrors = { ...errors };
                                        delete newErrors.capacity;
                                        setErrors(newErrors);
                                    }
                                }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputField
                                label="Occupied Beds (Auto)"
                                placeholder="0"
                                value={formData.occupied_beds}
                                editable={false}
                                onChangeText={() => { }}
                            />
                        </View>
                    </View>

                    <InputField
                        label="Monthly Rent (per bed) *"
                        placeholder="Amount in ₹"
                        keyboardType="numeric"
                        value={formData.rent_per_bed}
                        error={errors.rent_per_bed}
                        onChangeText={(text) => {
                            const newFormData = { ...formData, rent_per_bed: text };
                            setFormData(newFormData);
                            if (errors.rent_per_bed) {
                                const newErrors = { ...errors };
                                delete newErrors.rent_per_bed;
                                setErrors(newErrors);
                            }
                        }}
                    />

                    <Text style={styles.label}>Room Type *</Text>
                    <TouchableOpacity
                        style={[styles.selectField, errors.room_type_id && styles.selectFieldError]}
                        onPress={() => setTypeModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.selectLeft}>
                            <LayoutGrid size={18} color={errors.room_type_id ? "#EF4444" : "#FF6B6B"} style={{ marginRight: 10 }} />
                            <Text style={[styles.selectText, !formData.room_type_id && { color: '#94A3B8' }]}>
                                {formData.room_type_id
                                    ? roomTypes.find(t => t.room_type_id.toString() === formData.room_type_id)?.room_type_name
                                    : "Select Room Type"}
                            </Text>
                        </View>
                        <ChevronDown size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    {errors.room_type_id && <Text style={styles.errorText}>{errors.room_type_id}</Text>}

                    <Text style={[styles.label, { marginTop: 16 }]}>Amenities</Text>
                    <View style={styles.amenitiesContainer}>
                        {amenitiesList.map((amenity, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.amenityChip,
                                    formData.selectedAmenities.includes(amenity.amenity_name) && styles.amenityChipActive
                                ]}
                                onPress={() => toggleAmenity(amenity.amenity_name)}
                                activeOpacity={0.7}
                            >
                                {formData.selectedAmenities.includes(amenity.amenity_name) && (
                                    <Check size={14} color="#FFF" style={{ marginRight: 4 }} />
                                )}
                                <Text style={[
                                    styles.amenityText,
                                    formData.selectedAmenities.includes(amenity.amenity_name) && styles.amenityTextActive
                                ]}>{amenity.amenity_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>{isEdit ? "Update" : "Create"}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>



            {/* Room Type Modal - FIXED SINGLE SHADE */}
            <Modal
                visible={typeModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setTypeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setTypeModalVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalContent}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Room Type</Text>
                            <TouchableOpacity
                                onPress={() => setTypeModalVisible(false)}
                                style={styles.closeBtn}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.closeText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={roomTypes}
                            keyExtractor={(item) => item.room_type_id.toString()}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalOption, formData.room_type_id === item.room_type_id.toString() && styles.modalOptionSelected]}
                                    onPress={() => {
                                        const newFormData = { ...formData, room_type_id: item.room_type_id.toString() };
                                        setFormData(newFormData);
                                        setTypeModalVisible(false);
                                        if (errors.room_type_id) {
                                            const newErrors = { ...errors };
                                            delete newErrors.room_type_id;
                                            setErrors(newErrors);
                                        }
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.optionText, formData.room_type_id === item.room_type_id.toString() && styles.optionTextSelected]}>
                                        {item.room_type_name}
                                    </Text>
                                    {formData.room_type_id === item.room_type_id.toString() && <Check size={20} color="#FF6B6B" />}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, padding: 20 },
    formCard: { padding: 20, marginBottom: 20 },
    row: { flexDirection: 'row' },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 12,
        marginLeft: 4,
    },
    selectField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 12,
        // NO BORDER
    },
    selectFieldError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1.5,
        borderColor: '#EF4444',
    },
    selectLeft: { flexDirection: 'row', alignItems: 'center' },
    selectText: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // SINGLE SHADE ONLY
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        maxHeight: '70%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    closeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#FFF1F1',
    },
    closeText: { color: '#FF6B6B', fontWeight: '700', fontSize: 14 },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    modalOptionSelected: {
        backgroundColor: '#FFF9F9',
    },
    optionText: { fontSize: 15, color: '#334155', fontWeight: '500' },
    optionTextSelected: {
        color: '#FF6B6B',
        fontWeight: '700',
    },
    amenitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    amenityChipActive: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
    },
    amenityText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    amenityTextActive: { color: '#FFF', fontWeight: '600' },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40
    },
    resetButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF'
    },
    resetButtonText: { color: '#475569', fontWeight: '600', fontSize: 15 },
    saveButton: {
        flex: 2,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
    disabledButton: { opacity: 0.7 },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '500'
    },
});

export default AddRoomScreen;