import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft, User, Phone, Mail, Home, MapPin,
    ChevronRight, Calendar, CreditCard, Users,
    Fingerprint, Layers, Check, ChevronDown, Camera
} from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import api from '../services/api';
import { showErrorToast, showSuccessToast } from '../hooks/Toastconfig';

// ─── ID Proof config: placeholder & max-length per type ───────────────────────
const ID_PROOF_CONFIG: Record<string, { placeholder: string; maxLength: number; keyboardType: 'default' | 'numeric' }> = {
    aadhaar: { placeholder: 'e.g. 2345 6789 0123', maxLength: 12, keyboardType: 'numeric' },
    aadhar: { placeholder: 'e.g. 2345 6789 0123', maxLength: 12, keyboardType: 'numeric' },
    pan: { placeholder: 'e.g. ABCDE1234F', maxLength: 10, keyboardType: 'default' },
    voter: { placeholder: 'e.g. ABC1234567', maxLength: 10, keyboardType: 'default' },
    passport: { placeholder: 'e.g. A1234567', maxLength: 8, keyboardType: 'default' },
    driving: { placeholder: 'e.g. DL0420110149646', maxLength: 16, keyboardType: 'default' },
    'driving license': { placeholder: 'e.g. DL0420110149646', maxLength: 16, keyboardType: 'default' },
};

function getIdProofConfig(typeName?: string) {
    if (!typeName) return { placeholder: 'Enter ID Number', maxLength: 20, keyboardType: 'default' as const };
    const key = typeName.toLowerCase().trim();
    for (const [k, v] of Object.entries(ID_PROOF_CONFIG)) {
        if (key.includes(k)) return v;
    }
    return { placeholder: 'Enter ID Number', maxLength: 20, keyboardType: 'default' as const };
}

// ─── FormInput ─────────────────────────────────────────────────────────────────
const FormInput = ({
    label, icon: Icon, placeholder, value, onChangeText,
    keyboardType, multiline, error, maxLength, scrollRef, inputRef
}: any) => {

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[
                styles.inputContainer,
                multiline && styles.multilineContainer,
                error && styles.inputError,
            ]}>
                <View style={styles.inputIcon}>
                    <Icon size={18} color={error ? '#EF4444' : '#FF6B6B'} />
                </View>
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {},
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor="#BBBBBB"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType || 'default'}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    underlineColorAndroid="transparent"
                    maxLength={maxLength}
                    autoCorrect={false}
                    onFocus={() => {
                        // Give keyboard time to appear, then scroll
                        if (scrollRef?.current && inputRef?.current) {
                            setTimeout(() => {
                                inputRef.current?.measureLayout?.(
                                    scrollRef.current,
                                    (_x: number, y: number) => {
                                        scrollRef.current?.scrollTo({ y: y - 120, animated: true });
                                    },
                                    () => { }
                                );
                            }, 300);
                        }
                    }}
                />
                {maxLength && (
                    <Text style={styles.charCount}>
                        {value?.length || 0}/{maxLength}
                    </Text>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

// ─── Selector ──────────────────────────────────────────────────────────────────
const Selector = ({ label, options, selected, onSelect }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.selectorRow}>
            {options.map((opt: string) => (
                <TouchableOpacity
                    key={opt}
                    style={[styles.selectorItem, selected === opt && styles.selectorItemActive]}
                    onPress={() => onSelect(opt)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.selectorText, selected === opt && styles.selectorTextActive]}>
                        {opt}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// ─── SelectField ───────────────────────────────────────────────────────────────
const SelectField = ({ label, value, placeholder, icon: Icon, onPress, error }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
            style={[styles.inputContainer, error && styles.inputError]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.inputIcon}>
                <Icon size={18} color={error ? '#EF4444' : '#FF6B6B'} />
            </View>
            <Text style={[styles.inputText, !value && { color: '#BBBBBB' }]}>
                {value || placeholder}
            </Text>
            <ChevronDown size={18} color="#94A3B8" />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

// ─── BottomDrawer ──────────────────────────────────────────────────────────────
const BottomDrawer = ({
    visible, title, data, selectedId, onSelect, onClose,
    keyExtractor, labelExtractor, emptyText, searchable
}: any) => {
    const [search, setSearch] = React.useState('');
    const filteredData = React.useMemo(() => {
        if (!searchable || !search) return data;
        return data.filter((item: any) =>
            labelExtractor(item).toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search, searchable, labelExtractor]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContent} onPress={e => e.stopPropagation()}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                            <Text style={styles.closeText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    {searchable && (
                        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                            <TextInput
                                style={{ backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, fontSize: 16, color: '#1E293B' }}
                                placeholder="Search..."
                                placeholderTextColor="#94A3B8"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    )}
                    <FlatList
                        data={filteredData}
                        keyExtractor={keyExtractor}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Home size={40} color="#E2E8F0" />
                                <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 10, textAlign: 'center' }}>
                                    {emptyText || 'No options available'}
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const isSelected = selectedId === keyExtractor(item);
                            return (
                                <TouchableOpacity
                                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                                    onPress={() => { onSelect(item); onClose(); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {labelExtractor(item)}
                                    </Text>
                                    {isSelected && <Check size={20} color="#FF6B6B" />}
                                </TouchableOpacity>
                            );
                        }}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const AddStudentScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const { student, isEdit } = route.params || {};
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    // Individual input refs for scroll-on-focus
    const inputRefs = useRef<Record<string, any>>({});

    const [photoUri, setPhotoUri] = useState<string | null>(student?.photo || null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: 'Male',
        phone: '',
        email: '',
        date_of_birth: '',
        id_proof_number: '',
        id_proof_type_id: '',
        guardian_name: '',
        guardian_phone: '',
        guardian_relation_id: '',
        admission_date: new Date().toISOString().split('T')[0],
        admission_fee: '0',
        admission_status: 'Paid',
        permanent_address: '',
        room_id: '',
        floor_number: '',
        monthly_rent: '',
        status: 'Active',
    });

    const [idProofTypes, setIdProofTypes] = useState<any[]>([]);
    const [relations, setRelations] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    const [roomModalVisible, setRoomModalVisible] = useState(false);
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [proofModalVisible, setProofModalVisible] = useState(false);
    const [relationModalVisible, setRelationModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateMode, setDateMode] = useState<'dob' | 'admission'>('dob');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchInitialData();
        if (isEdit && student) {
            setFormData({
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                gender: student.gender || 'Male',
                phone: student.phone ? student.phone.replace(/\D/g, '').slice(0, 10) : '',
                email: student.email || '',
                date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
                id_proof_number: student.id_proof_number || '',
                id_proof_type_id: student.id_proof_type ? student.id_proof_type.toString() : '',
                guardian_name: student.guardian_name || '',
                guardian_phone: student.guardian_phone ? student.guardian_phone.replace(/\D/g, '').slice(0, 10) : '',
                guardian_relation_id: student.guardian_relation ? student.guardian_relation.toString() : '',
                admission_date: student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : '',
                admission_fee: student.admission_fee ? student.admission_fee.toString() : '0',
                admission_status: student.admission_status === 1 ? 'Paid' : 'Unpaid',
                permanent_address: student.permanent_address || '',
                room_id: student.room_id ? student.room_id.toString() : '',
                floor_number: student.floor_number ? student.floor_number.toString() : '',
                monthly_rent: student.monthly_rent ? student.monthly_rent.toString() : '',
                status: (student.status === 1 || student.status === 'Active') ? 'Active' : 'Inactive',
            });
        }
    }, [isEdit, student]);

    const fetchInitialData = async () => {
        try {
            const [proofRes, relRes, roomsRes] = await Promise.all([
                api.get('/id-proof-types'),
                api.get('/relations'),
                api.get(`/rooms?hostelId=${user?.hostel_id}&limit=100`),
            ]);
            if (proofRes.data.success) setIdProofTypes(proofRes.data.data);
            if (relRes.data.success) setRelations(relRes.data.data);
            if (roomsRes.data.success) setAvailableRooms(roomsRes.data.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    // ── Camera / Gallery ────────────────────────────────────────────────────────
    const handlePickPhoto = () => {
        Alert.alert('Add Photo', 'Choose an option', [
            {
                text: 'Take Photo',
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
                        return;
                    }
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                    });
                    if (!result.canceled && result.assets[0]) {
                        setPhotoUri(result.assets[0].uri);
                    }
                },
            },
            {
                text: 'Choose from Gallery',
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission Denied', 'Gallery permission is required.');
                        return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.8,
                    });
                    if (!result.canceled && result.assets[0]) {
                        setPhotoUri(result.assets[0].uri);
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    // ── ID Proof config for selected type ──────────────────────────────────────
    const selectedProofType = idProofTypes.find(t => t.id.toString() === formData.id_proof_type_id);
    const idConfig = getIdProofConfig(selectedProofType?.name);

    // ── Sanitize ID input based on type ────────────────────────────────────────
    const sanitizeIdProof = (text: string, typeName?: string) => {
        const key = (typeName || '').toLowerCase();
        if (key.includes('aadhar') || key.includes('aadhaar')) {
            return text.replace(/\D/g, '').slice(0, 12);
        }
        if (key.includes('pan')) {
            // PAN: AAAAA9999A — first 5 alpha, next 4 numeric, last 1 alpha
            const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
            return clean;
        }
        if (key.includes('passport')) {
            return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        }
        if (key.includes('voter')) {
            return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        }
        if (key.includes('driving')) {
            return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
        }
        return text.slice(0, 20);
    };

    // ── Reset ───────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setFormData({
            first_name: '', last_name: '', gender: 'Male',
            phone: '', email: '', date_of_birth: '',
            id_proof_number: '', id_proof_type_id: '',
            guardian_name: '', guardian_phone: '', guardian_relation_id: '',
            admission_date: new Date().toISOString().split('T')[0],
            admission_fee: '0', admission_status: 'Paid',
            permanent_address: '', room_id: '', floor_number: '',
            monthly_rent: '', status: 'Active',
        });
        setPhotoUri(null);
        setErrors({});
    };

    // ── Validate ────────────────────────────────────────────────────────────────
    const validate = () => {
        const newErrors: Record<string, string> = {};
        const nameRegex = /^[a-zA-Z0-9\s]+$/;
        const phoneRegex = /^\d{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.first_name) newErrors.first_name = 'First name is required';
        else if (!nameRegex.test(formData.first_name)) newErrors.first_name = 'Symbols not allowed';

        if (formData.last_name && !nameRegex.test(formData.last_name)) newErrors.last_name = 'Symbols not allowed';

        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Must be exactly 10 digits';

        if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.gender) newErrors.gender = 'Gender is required';

        if (!formData.guardian_phone) newErrors.guardian_phone = 'Guardian phone is required';
        else if (!phoneRegex.test(formData.guardian_phone)) newErrors.guardian_phone = 'Must be exactly 10 digits';

        // ID proof validation
        if (formData.id_proof_number && selectedProofType) {
            const key = selectedProofType.name.toLowerCase();
            if (key.includes('aadhar') || key.includes('aadhaar')) {
                if (!/^\d{12}$/.test(formData.id_proof_number)) newErrors.id_proof_number = 'Aadhaar must be exactly 12 digits';
            } else if (key.includes('pan')) {
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.id_proof_number)) newErrors.id_proof_number = 'Invalid PAN format (e.g. ABCDE1234F)';
            } else if (key.includes('passport')) {
                if (formData.id_proof_number.length !== 8) newErrors.id_proof_number = 'Passport must be exactly 8 characters';
            } else if (key.includes('voter')) {
                if (formData.id_proof_number.length !== 10) newErrors.id_proof_number = 'Voter ID must be exactly 10 characters';
            }
        }

        if (!formData.admission_date) newErrors.admission_date = 'Admission date is required';
        if (!formData.admission_fee) newErrors.admission_fee = 'Admission fee is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Save ─────────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) {
            showErrorToast('Validation Error', 'Please fix the highlighted fields');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                hostel_id: user?.hostel_id,
                admission_fee: parseFloat(formData.admission_fee),
                admission_status: formData.admission_status === 'Paid' ? 1 : 0,
                status: formData.status === 'Active' ? 1 : 0,
                room_id: formData.room_id ? parseInt(formData.room_id) : null,
                floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
                id_proof_type: formData.id_proof_type_id || null,
                guardian_relation: formData.guardian_relation_id || null,
                id_proof_status: 1,
                monthly_rent: parseFloat(formData.monthly_rent || '0'),
                photo: photoUri || null,
            };
            let response;
            if (isEdit) response = await api.put(`/students/${student.student_id}`, payload);
            else response = await api.post('/students', payload);

            if (response.data.success) {
                showSuccessToast('Success!', `Student ${isEdit ? 'updated' : 'registered'} successfully`);
                setTimeout(() => navigation.goBack(), 1000);
            }
        } catch (error: any) {
            console.error('Error saving student:', error);
            showErrorToast('Error', error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'register'} student`);
        } finally {
            setLoading(false);
        }
    };

    const update = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));
    const clearError = (key: string) => setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient colors={['#FF8585', '#FF6B6B']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.greeting}>{isEdit ? 'Edit Student' : 'New Student'}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {/* ── ScrollView with extra bottom padding so fields never hide behind keyboard ── */}
            <ScrollView
                ref={scrollRef}
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8} onPress={handlePickPhoto}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Camera size={32} color="#FF6BCB" />
                                <Text style={styles.avatarText}>Add Photo</Text>
                            </View>
                        )}
                        {/* <View style={styles.cameraBadge}>
                            <Camera size={12} color="#FFF" />
                        </View> */}
                    </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
                    {/* ── Personal Info ── */}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <FormInput
                                label="First Name *"
                                icon={User}
                                placeholder="John"
                                value={formData.first_name}
                                error={errors.first_name}
                                scrollRef={scrollRef}
                                inputRef={{ current: inputRefs.current['first_name'] }}
                                onChangeText={(text: string) => {
                                    const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, '');
                                    update('first_name', cleaned);
                                    if (cleaned) clearError('first_name');
                                }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Last Name"
                                icon={User}
                                placeholder="Doe"
                                value={formData.last_name}
                                error={errors.last_name}
                                onChangeText={(text: string) => update('last_name', text.replace(/[^a-zA-Z0-9\s]/g, ''))}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <SelectField label="Gender *" value={formData.gender} placeholder="Select Gender" icon={Users} onPress={() => setGenderModalVisible(true)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <SelectField label="Date of Birth" icon={Calendar} placeholder="Select DOB" value={formData.date_of_birth}
                                onPress={() => { setDateMode('dob'); setShowDatePicker(true); }} />
                        </View>
                    </View>

                    <FormInput
                        label="Phone Number *"
                        icon={Phone}
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        error={errors.phone}
                        maxLength={10}
                        onChangeText={(text: string) => {
                            const cleaned = text.replace(/\D/g, '').slice(0, 10);
                            update('phone', cleaned);
                            if (cleaned.length === 10) clearError('phone');
                        }}
                    />

                    <FormInput
                        label="Email Address"
                        icon={Mail}
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        value={formData.email}
                        error={errors.email}
                        onChangeText={(text: string) => {
                            update('email', text.trim());
                            clearError('email');
                        }}
                    />

                    {/* ── Identity ── */}
                    <Text style={styles.sectionTitle}>Identity & Security</Text>
                    <SelectField label="ID Proof Type" value={selectedProofType?.name} placeholder="Select ID Type" icon={Fingerprint} onPress={() => setProofModalVisible(true)} />

                    {/* ID Number with smart placeholder, maxLength, keyboard restriction */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>
                            {selectedProofType ? `${selectedProofType.name} Number` : 'ID Number'}
                            {idConfig.maxLength < 20 ? ` (${idConfig.maxLength} chars)` : ''}
                        </Text>
                        <View style={[styles.inputContainer, errors.id_proof_number && styles.inputError]}>
                            <View style={styles.inputIcon}>
                                <CreditCard size={18} color={errors.id_proof_number ? '#EF4444' : '#FF6B6B'} />
                            </View>
                            <TextInput
                                style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
                                placeholder={idConfig.placeholder}
                                placeholderTextColor="#BBBBBB"
                                value={formData.id_proof_number}
                                keyboardType={idConfig.keyboardType}
                                maxLength={idConfig.maxLength}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                underlineColorAndroid="transparent"
                                onChangeText={(text: string) => {
                                    const cleaned = sanitizeIdProof(text, selectedProofType?.name);
                                    update('id_proof_number', cleaned);
                                    if (cleaned) clearError('id_proof_number');
                                }}
                            />
                            <Text style={styles.charCount}>
                                {formData.id_proof_number.length}/{idConfig.maxLength}
                            </Text>
                        </View>
                        {/* Format hint */}
                        {selectedProofType && (
                            <Text style={styles.hintText}>
                                {selectedProofType.name.toLowerCase().includes('pan')
                                    ? '⚡ Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)'
                                    : selectedProofType.name.toLowerCase().includes('aadhar') || selectedProofType.name.toLowerCase().includes('aadhaar')
                                        ? '⚡ Must be exactly 12 digits'
                                        : selectedProofType.name.toLowerCase().includes('passport')
                                            ? '⚡ Must be exactly 8 characters'
                                            : `⚡ Must be exactly ${idConfig.maxLength} characters`}
                            </Text>
                        )}
                        {errors.id_proof_number && <Text style={styles.errorText}>{errors.id_proof_number}</Text>}
                    </View>

                    {/* ── Guardian ── */}
                    <Text style={styles.sectionTitle}>Guardian Information</Text>
                    <FormInput
                        label="Guardian Name"
                        icon={User}
                        placeholder="Robert Doe"
                        value={formData.guardian_name}
                        onChangeText={(text: string) => update('guardian_name', text.replace(/[^a-zA-Z\s]/g, ''))}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <SelectField label="Relation" value={relations.find(r => r.relation_id.toString() === formData.guardian_relation_id)?.relation_name}
                                placeholder="Select" icon={Users} onPress={() => setRelationModalVisible(true)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Guardian Phone *"
                                icon={Phone}
                                placeholder="9876543211"
                                keyboardType="phone-pad"
                                value={formData.guardian_phone}
                                error={errors.guardian_phone}
                                maxLength={10}
                                onChangeText={(text: string) => {
                                    const cleaned = text.replace(/\D/g, '').slice(0, 10);
                                    update('guardian_phone', cleaned);
                                    if (cleaned.length === 10) clearError('guardian_phone');
                                }}
                            />
                        </View>
                    </View>

                    {/* ── Admission ── */}
                    <Text style={styles.sectionTitle}>Admission Details</Text>
                    <SelectField label="Admission Date *" icon={Calendar} placeholder="Select Date" value={formData.admission_date} error={errors.admission_date}
                        onPress={() => { setDateMode('admission'); setShowDatePicker(true); }} />
                    <FormInput
                        label="Admission Fee (₹) *"
                        icon={CreditCard}
                        placeholder="0"
                        keyboardType="numeric"
                        value={formData.admission_fee}
                        error={errors.admission_fee}
                        onChangeText={(text: string) => {
                            const cleaned = text.replace(/\D/g, '');
                            update('admission_fee', cleaned);
                            if (cleaned) clearError('admission_fee');
                        }}
                    />
                    <Selector label="Payment Status *" options={['Paid', 'Unpaid']} selected={formData.admission_status}
                        onSelect={(val: string) => update('admission_status', val)} />

                    {/* ── Room ── */}
                    <Text style={styles.sectionTitle}>Room Allocation</Text>
                    <SelectField label="Room Allocation"
                        value={formData.room_id ? `Room ${availableRooms.find(r => r.room_id.toString() === formData.room_id)?.room_number}` : ''}
                        placeholder="Choose Room" error={errors.room_id} icon={Home} onPress={() => setRoomModalVisible(true)} />
                    <FormInput
                        label="Monthly Rent (₹)"
                        icon={CreditCard}
                        placeholder="Enter Rent Amount"
                        keyboardType="numeric"
                        value={formData.monthly_rent}
                        scrollRef={scrollRef}
                        onChangeText={(text: string) => update('monthly_rent', text.replace(/\D/g, ''))}
                    />

                    {/* ── Address ── */}
                    <Text style={styles.sectionTitle}>Address Details</Text>
                    <FormInput
                        label="Permanent Address"
                        icon={MapPin}
                        placeholder="Full address..."
                        multiline
                        value={formData.permanent_address}
                        scrollRef={scrollRef}
                        onChangeText={(text: string) => update('permanent_address', text)}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7} disabled={loading}>
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSave} activeOpacity={0.8} disabled={loading}>
                        <LinearGradient colors={loading ? ['#CCCCCC', '#AAAAAA'] : ['#FF8585', '#FF6B6B']} style={styles.submitGradient}>
                            {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : (
                                <><Text style={styles.submitText}>Save</Text><ChevronRight color="#FFFFFF" size={18} /></>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Extra bottom padding so last fields clear the keyboard */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* ── Modals ── */}
            <BottomDrawer visible={genderModalVisible} title="Select Gender" data={['Male', 'Female', 'Other']}
                selectedId={formData.gender} keyExtractor={(i: string) => i} labelExtractor={(i: string) => i}
                onSelect={(i: string) => update('gender', i)} onClose={() => setGenderModalVisible(false)} />

            <BottomDrawer visible={proofModalVisible} title="Select ID Proof Type" data={idProofTypes}
                selectedId={formData.id_proof_type_id} keyExtractor={(i: any) => i.id.toString()}
                labelExtractor={(i: any) => i.name}
                onSelect={(i: any) => { update('id_proof_type_id', i.id.toString()); update('id_proof_number', ''); }}
                onClose={() => setProofModalVisible(false)} />

            <BottomDrawer visible={relationModalVisible} title="Select Relation" data={relations}
                selectedId={formData.guardian_relation_id} keyExtractor={(i: any) => i.relation_id.toString()}
                labelExtractor={(i: any) => i.relation_name}
                onSelect={(i: any) => update('guardian_relation_id', i.relation_id.toString())}
                onClose={() => setRelationModalVisible(false)} />

            <BottomDrawer visible={roomModalVisible} title="Select Room" data={availableRooms}
                searchable selectedId={formData.room_id} keyExtractor={(i: any) => i.room_id.toString()}
                labelExtractor={(i: any) => `Room ${i.room_number} (Floor ${i.floor_number || 0}) - ${i.available_beds} beds left`}
                emptyText="No rooms available."
                onSelect={(i: any) => {
                    setFormData(prev => ({
                        ...prev,
                        room_id: i.room_id.toString(),
                        floor_number: i.floor_number ? i.floor_number.toString() : '',
                        monthly_rent: i.rent_per_bed ? i.rent_per_bed.toString() : prev.monthly_rent,
                    }));
                }}
                onClose={() => setRoomModalVisible(false)} />

            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={(() => {
                    try {
                        const d = dateMode === 'dob'
                            ? (formData.date_of_birth ? new Date(formData.date_of_birth) : new Date(2000, 0, 1))
                            : (formData.admission_date ? new Date(formData.admission_date) : new Date());
                        return isNaN(d.getTime()) ? new Date() : d;
                    } catch { return new Date(); }
                })()}
                onConfirm={(d: Date) => {
                    setShowDatePicker(false);
                    const s = d.toISOString().split('T')[0];
                    if (dateMode === 'dob') update('date_of_birth', s);
                    else update('admission_date', s);
                }}
                onCancel={() => setShowDatePicker(false)}
            />
        </KeyboardAvoidingView>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    greeting: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    content: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
    avatarSection: { alignItems: 'center', marginVertical: 20 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FF6B6B', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 10, color: '#FF6BCB', fontWeight: '700', marginTop: 4 },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF6B6B', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 24, marginBottom: 16, letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#666666', marginBottom: 8, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, height: 50 },
    inputError: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#EF4444' },
    multilineContainer: { height: 100, alignItems: 'flex-start', paddingTop: 12 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
    inputText: { flex: 1, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
    multilineInput: { textAlignVertical: 'top', height: 80 },
    charCount: { fontSize: 11, color: '#94A3B8', marginLeft: 4 },
    hintText: { fontSize: 11, color: '#6366F1', marginTop: 5, marginLeft: 4, fontWeight: '500' },
    selectorRow: { flexDirection: 'row', gap: 10 },
    selectorItem: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#F8FAFC' },
    selectorItemActive: { borderColor: '#FF6B6B', backgroundColor: '#FFF1F1' },
    selectorText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    selectorTextActive: { color: '#FF6B6B', fontWeight: '700' },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    resetButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
    resetButtonText: { color: '#475569', fontWeight: '600', fontSize: 15 },
    submitButton: { flex: 2, borderRadius: 12, overflow: 'hidden' },
    disabledButton: { opacity: 0.7 },
    submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6, minHeight: 48 },
    submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '500' },
    row: { flexDirection: 'row' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, maxHeight: '70%' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    closeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FFF1F1' },
    closeText: { color: '#FF6B6B', fontWeight: '700', fontSize: 14 },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    modalOptionSelected: { backgroundColor: '#FFF9F9' },
    optionText: { fontSize: 15, color: '#334155', fontWeight: '500' },
    optionTextSelected: { color: '#FF6B6B', fontWeight: '700' },
});

export default AddStudentScreen;