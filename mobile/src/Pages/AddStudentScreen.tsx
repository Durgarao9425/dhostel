import React, { useState, useEffect } from 'react';
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
    ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Phone, Mail, Home, MapPin, ChevronRight, Calendar, CreditCard, Users, Fingerprint, Layers, Check, ChevronDown } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Modal, FlatList } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../services/api';
import { showErrorToast, showSuccessToast } from '../hooks/Toastconfig';

const FormInput = ({ label, icon: Icon, placeholder, value, onChangeText, keyboardType, multiline, error }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[
            styles.inputContainer,
            multiline && styles.multilineContainer,
            error && styles.inputError
        ]}>
            <View style={styles.inputIcon}>
                <Icon size={18} color={error ? "#EF4444" : "#FF6B6B"} />
            </View>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
                placeholder={placeholder}
                placeholderTextColor="#BBBBBB"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                underlineColorAndroid="transparent"
            />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

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
                    <Text style={[styles.selectorText, selected === opt && styles.selectorTextActive]}>{opt}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const SelectField = ({ label, value, placeholder, icon: Icon, onPress, error }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
            style={[
                styles.inputContainer,
                error && styles.inputError
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.inputIcon}>
                <Icon size={18} color={error ? "#EF4444" : "#FF6B6B"} />
            </View>
            <Text style={[styles.inputText, !value && { color: '#BBBBBB' }]}>
                {value || placeholder}
            </Text>
            <ChevronDown size={18} color="#94A3B8" />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const BottomDrawer = ({ visible, title, data, selectedId, onSelect, onClose, keyExtractor, labelExtractor, emptyText, searchable }: any) => {
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
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalContent}
                    onPress={(e) => e.stopPropagation()}
                >
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
                                style={{
                                    backgroundColor: '#F1F5F9',
                                    padding: 12,
                                    borderRadius: 10,
                                    fontSize: 16,
                                    color: '#1E293B'
                                }}
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
                            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                                <Home size={40} color="#E2E8F0" />
                                <Text style={{ color: '#94A3B8', fontSize: 14, marginTop: 10, textAlign: 'center' }}>
                                    {emptyText || "No options available"}
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const isSelected = selectedId === keyExtractor(item);
                            return (
                                <TouchableOpacity
                                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
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
    )
};



export const AddStudentScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const { student, isEdit } = route.params || {};
    const [loading, setLoading] = useState(false);
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
    });

    const [idProofTypes, setIdProofTypes] = useState<any[]>([]);
    const [relations, setRelations] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [hostelDetails, setHostelDetails] = useState<any>(null);

    const [roomModalVisible, setRoomModalVisible] = useState(false);
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [proofModalVisible, setProofModalVisible] = useState(false);
    const [relationModalVisible, setRelationModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateMode, setDateMode] = useState<'dob' | 'admission'>('dob');

    // Removed filteredRooms logic as we now show all rooms with search

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
            });
        }
    }, [isEdit, student]);

    const fetchInitialData = async () => {
        try {
            const [proofRes, relRes, roomsRes, hostelRes] = await Promise.all([
                api.get('/id-proof-types'),
                api.get('/relations'),
                api.get(`/rooms?hostelId=${user?.hostel_id}&limit=100`),
                user?.hostel_id ? api.get(`/hostels/${user.hostel_id}`) : Promise.resolve({ data: { success: false } })
            ]);

            if (proofRes.data.success) setIdProofTypes(proofRes.data.data);
            if (relRes.data.success) setRelations(relRes.data.data);
            if (roomsRes.data.success) {
                setAvailableRooms(roomsRes.data.data);
            }
            if (hostelRes.data.success) setHostelDetails(hostelRes.data.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleReset = () => {
        setFormData({
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
        });
        setErrors({});
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const nameRegex = /^[a-zA-Z0-9\s]+$/;
        const phoneRegex = /^\d{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const aadhaarRegex = /^\d{12}$/;

        if (!formData.first_name) {
            newErrors.first_name = 'First name is required';
        } else if (!nameRegex.test(formData.first_name)) {
            newErrors.first_name = 'Symbols/Numbers not allowed';
        }

        if (formData.last_name && !nameRegex.test(formData.last_name)) {
            newErrors.last_name = 'Symbols/Numbers not allowed';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Must be exactly 10 digits';
        }

        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.gender) newErrors.gender = 'Gender is required';

        if (!formData.guardian_phone) {
            newErrors.guardian_phone = 'Guardian phone is required';
        } else if (!phoneRegex.test(formData.guardian_phone)) {
            newErrors.guardian_phone = 'Must be exactly 10 digits';
        }

        const isAadhaar = idProofTypes.find(t => t.id.toString() === formData.id_proof_type_id)?.name.toLowerCase().includes('aadhar');
        if (formData.id_proof_number && isAadhaar && !aadhaarRegex.test(formData.id_proof_number)) {
            newErrors.id_proof_number = 'Aadhaar must be 12 digits';
        }

        if (!formData.admission_date) newErrors.admission_date = 'Admission date is required';
        if (!formData.admission_fee) newErrors.admission_fee = 'Admission fee is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            // Re-run validation to get errors (since state update might be async/batched, but here we set it in validate)
            // Actually validate() sets state. We can use the logic inside validate to get keys, 
            // but since we just ran it, 'errors' state might not be updated yet in this closure?
            // Wait, validate() returns boolean.
            // Let's modify validate to RETURN errors or rely on the fact that if it returns false, we can find out why.
            // Be safer: construct error string inside validate? Or just do this:

            // To be sure we show the correct errors, let's just grab them from the same logic if possible or trust the user sees the red boxes.
            // But user asked "what error is trigger". So showing the fields is helpful.

            // Let's copy-paste the error detection logic or assume the user sees the red text. 
            // Actually, I'll alert the fields.
            const validationErrors = [];
            const nameRegex = /^[a-zA-Z0-9\s]+$/;
            const phoneRegex = /^\d{10}$/;
            const aadhaarRegex = /^\d{12}$/;

            if (!formData.first_name) validationErrors.push('First Name');
            else if (!nameRegex.test(formData.first_name)) validationErrors.push('First Name (Invalid)');

            if (!formData.phone) validationErrors.push('Phone');
            else if (!phoneRegex.test(formData.phone)) validationErrors.push('Phone (Must be 10 digits)');

            if (!formData.guardian_phone) validationErrors.push('Guardian Phone');
            else if (!phoneRegex.test(formData.guardian_phone)) validationErrors.push('Guardian Phone (Must be 10 digits)');

            if (!formData.gender) validationErrors.push('Gender');
            if (!formData.admission_date) validationErrors.push('Admission Date');
            if (!formData.admission_fee) validationErrors.push('Admission Fee');
            if (!formData.room_id) validationErrors.push('Room Allocation');

            showErrorToast('Validation Error', 'Please check: ' + validationErrors.join(', '));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                hostel_id: user?.hostel_id,
                admission_fee: parseFloat(formData.admission_fee),
                admission_status: formData.admission_status === 'Paid' ? 1 : 0,
                status: isEdit ? student.status : 1, // Preserve status on edit or default to 1 on create
                room_id: formData.room_id ? parseInt(formData.room_id) : null,
                floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
                id_proof_type: formData.id_proof_type_id || null,
                guardian_relation: formData.guardian_relation_id || null,
                id_proof_status: 1,
                monthly_rent: parseFloat(formData.monthly_rent || '0'),
            };

            let response;
            if (isEdit) {
                response = await api.put(`/students/${student.student_id}`, payload);
            } else {
                response = await api.post('/students', payload);
            }

            if (response.data.success) {
                showSuccessToast('Success!', `Student ${isEdit ? 'updated' : 'registered'} successfully`);
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);
            }
        } catch (error: any) {
            console.error('Error saving student:', error);
            showErrorToast('Error', error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'register'} student`);
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

            <LinearGradient
                colors={['#FF8585', '#FF6B6B']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.greeting}>{isEdit ? 'Edit Student' : 'New Student'}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formCard}>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <FormInput
                                label="First Name *"
                                icon={User}
                                placeholder="John"
                                value={formData.first_name}
                                error={errors.first_name}
                                onChangeText={(text: string) => {
                                    // Allow letters, numbers and spaces
                                    const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, '');
                                    const newFormData = { ...formData, first_name: cleaned };
                                    setFormData(newFormData);
                                    if (errors.first_name && cleaned) {
                                        const newErrors = { ...errors };
                                        delete newErrors.first_name;
                                        setErrors(newErrors);
                                    }
                                }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Last Name"
                                icon={User}
                                placeholder="Doe"
                                value={formData.last_name}
                                onChangeText={(text: string) => {
                                    const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, '');
                                    const newFormData = { ...formData, last_name: cleaned };
                                    setFormData(newFormData);
                                }}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <SelectField
                                label="Gender *"
                                value={formData.gender}
                                placeholder="Select Gender"
                                icon={Users}
                                onPress={() => setGenderModalVisible(true)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <SelectField
                                label="Date of Birth"
                                icon={Calendar}
                                placeholder="Select DOB"
                                value={formData.date_of_birth}
                                onPress={() => {
                                    setDateMode('dob');
                                    setShowDatePicker(true);
                                }}
                            />
                        </View>
                    </View>

                    <FormInput
                        label="Phone Number *"
                        icon={Phone}
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        error={errors.phone}
                        onChangeText={(text: string) => {
                            const cleaned = text.replace(/\D/g, '').slice(0, 10);
                            const newFormData = { ...formData, phone: cleaned };
                            setFormData(newFormData);
                            if (errors.phone && cleaned.length === 10) {
                                const newErrors = { ...errors };
                                delete newErrors.phone;
                                setErrors(newErrors);
                            }
                        }}
                    />
                    <FormInput
                        label="Email Address"
                        icon={Mail}
                        placeholder="john@example.com"
                        keyboardType="email-address"
                        value={formData.email}
                        onChangeText={(text: string) => {
                            const cleaned = text.trim();
                            const newFormData = { ...formData, email: cleaned };
                            setFormData(newFormData);
                        }}
                    />

                    <Text style={styles.sectionTitle}>Identity & Security</Text>
                    <SelectField
                        label="ID Proof Type"
                        value={idProofTypes.find(t => t.id.toString() === formData.id_proof_type_id)?.name}
                        placeholder="Select ID Type"
                        icon={Fingerprint}
                        onPress={() => setProofModalVisible(true)}
                    />
                    <FormInput
                        label="Aadhar / ID Number"
                        icon={CreditCard}
                        placeholder="Enter ID Number"
                        value={formData.id_proof_number}
                        onChangeText={(text: string) => {
                            const isAadhaar = idProofTypes.find(t => t.id.toString() === formData.id_proof_type_id)?.name.toLowerCase().includes('aadhar');
                            const cleaned = isAadhaar ? text.replace(/\D/g, '').slice(0, 12) : text;
                            const newFormData = { ...formData, id_proof_number: cleaned };
                            setFormData(newFormData);
                        }}
                    />

                    <Text style={styles.sectionTitle}>Guardian Information</Text>
                    <FormInput
                        label="Guardian Name"
                        icon={User}
                        placeholder="Ex: Robert Doe"
                        value={formData.guardian_name}
                        onChangeText={(text: string) => {
                            const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, '');
                            const newFormData = { ...formData, guardian_name: cleaned };
                            setFormData(newFormData);
                        }}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <SelectField
                                label="Relation"
                                value={relations.find(r => r.relation_id.toString() === formData.guardian_relation_id)?.relation_name}
                                placeholder="Select Relation"
                                icon={Users}
                                onPress={() => setRelationModalVisible(true)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormInput
                                label="Guardian Phone *"
                                icon={Phone}
                                placeholder="9876543211"
                                keyboardType="phone-pad"
                                value={formData.guardian_phone}
                                error={errors.guardian_phone}
                                onChangeText={(text: string) => {
                                    const cleaned = text.replace(/\D/g, '').slice(0, 10);
                                    const newFormData = { ...formData, guardian_phone: cleaned };
                                    setFormData(newFormData);
                                    if (errors.guardian_phone && cleaned.length === 10) {
                                        const newErrors = { ...errors };
                                        delete newErrors.guardian_phone;
                                        setErrors(newErrors);
                                    }
                                }}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Admission Details</Text>
                    <SelectField
                        label="Admission Date *"
                        icon={Calendar}
                        placeholder="Select Date"
                        value={formData.admission_date}
                        error={errors.admission_date}
                        onPress={() => {
                            setDateMode('admission');
                            setShowDatePicker(true);
                        }}
                    />
                    <FormInput
                        label="Admission Fee (₹) *"
                        icon={CreditCard}
                        placeholder="0"
                        keyboardType="numeric"
                        value={formData.admission_fee}
                        error={errors.admission_fee}
                        onChangeText={(text: string) => {
                            const cleaned = text.replace(/\D/g, '');
                            const newFormData = { ...formData, admission_fee: cleaned };
                            setFormData(newFormData);
                        }}
                    />
                    <Selector
                        label="Payment Status *"
                        options={['Paid', 'Unpaid']}
                        selected={formData.admission_status}
                        onSelect={(val: string) => {
                            const newFormData = { ...formData, admission_status: val };
                            setFormData(newFormData);
                        }}
                    />

                    <Text style={styles.sectionTitle}>Room Allocation</Text>
                    <SelectField
                        label="Room Allocation"
                        value={formData.room_id ? `Room ${availableRooms.find(r => r.room_id.toString() === formData.room_id)?.room_number}` : ''}
                        placeholder="Choose Room"
                        error={errors.room_id}
                        icon={Home}
                        onPress={() => setRoomModalVisible(true)}
                    />

                    <FormInput
                        label="Monthly Rent (₹)"
                        icon={CreditCard}
                        placeholder="Enter Rent Amount"
                        keyboardType="numeric"
                        value={formData.monthly_rent}
                        onChangeText={(text: string) => {
                            const newFormData = { ...formData, monthly_rent: text.replace(/\D/g, '') };
                            setFormData(newFormData);
                        }}
                    />

                    <Text style={styles.sectionTitle}>Address Details</Text>
                    <FormInput
                        label="Permanent Address"
                        icon={MapPin}
                        placeholder="Full address..."
                        multiline
                        value={formData.permanent_address}
                        onChangeText={(text: string) => {
                            const newFormData = { ...formData, permanent_address: text };
                            setFormData(newFormData);
                        }}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                        activeOpacity={0.7}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#CCCCCC', '#AAAAAA'] : ['#FF8585', '#FF6B6B']}
                            style={styles.submitGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Save</Text>
                                    <ChevronRight color="#FFFFFF" size={18} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            <BottomDrawer
                visible={genderModalVisible}
                title="Select Gender"
                data={['Male', 'Female', 'Other']}
                selectedId={formData.gender}
                keyExtractor={(item: string) => item}
                labelExtractor={(item: string) => item}
                onSelect={(item: string) => {
                    const newFormData = { ...formData, gender: item };
                    setFormData(newFormData);
                }}
                onClose={() => setGenderModalVisible(false)}
            />

            <BottomDrawer
                visible={proofModalVisible}
                title="Select ID Proof Type"
                data={idProofTypes}
                selectedId={formData.id_proof_type_id}
                keyExtractor={(item: any) => item.id.toString()}
                labelExtractor={(item: any) => item.name}
                onSelect={(item: any) => {
                    const newFormData = { ...formData, id_proof_type_id: item.id.toString() };
                    setFormData(newFormData);
                }}
                onClose={() => setProofModalVisible(false)}
            />

            <BottomDrawer
                visible={relationModalVisible}
                title="Select Relation"
                data={relations}
                selectedId={formData.guardian_relation_id}
                keyExtractor={(item: any) => item.relation_id.toString()}
                labelExtractor={(item: any) => item.relation_name}
                onSelect={(item: any) => {
                    const newFormData = { ...formData, guardian_relation_id: item.relation_id.toString() };
                    setFormData(newFormData);
                }}
                onClose={() => setRelationModalVisible(false)}
            />

            <BottomDrawer
                visible={roomModalVisible}
                title="Select Room"
                data={availableRooms}
                searchable={true}
                selectedId={formData.room_id}
                keyExtractor={(item: any) => item.room_id.toString()}
                labelExtractor={(item: any) => `Room ${item.room_number} (Floor ${item.floor_number || 0}) - ${item.available_beds} beds left`}
                emptyText="No rooms available."
                onSelect={(item: any) => {
                    const newFormData = {
                        ...formData,
                        room_id: item.room_id.toString(),
                        floor_number: item.floor_number ? item.floor_number.toString() : '',
                        monthly_rent: item.rent_per_bed ? item.rent_per_bed.toString() : formData.monthly_rent
                    };
                    setFormData(newFormData);
                }}
                onClose={() => setRoomModalVisible(false)}
            />

            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={(() => {
                    try {
                        const d = dateMode === 'dob'
                            ? (formData.date_of_birth ? new Date(formData.date_of_birth) : new Date(2000, 0, 1))
                            : (formData.admission_date ? new Date(formData.admission_date) : new Date());
                        return isNaN(d.getTime()) ? new Date() : d;
                    } catch {
                        return new Date();
                    }
                })()}
                onConfirm={(selectedDate: Date) => {
                    setShowDatePicker(false);
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    if (dateMode === 'dob') {
                        setFormData({ ...formData, date_of_birth: dateStr });
                    } else {
                        setFormData({ ...formData, admission_date: dateStr });
                    }
                }}
                onCancel={() => setShowDatePicker(false)}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 12,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    inputError: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1.5,
        borderColor: '#EF4444',
    },
    multilineContainer: {
        height: 100,
        alignItems: 'flex-start',
        paddingTop: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    multilineInput: {
        textAlignVertical: 'top',
        height: 80,
    },
    selectorRow: {
        flexDirection: 'row',
        gap: 10,
    },
    selectorItem: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    selectorItemActive: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF1F1',
    },
    selectorText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    selectorTextActive: {
        color: '#FF6B6B',
        fontWeight: '700',
    },
    submitButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
        minHeight: 48,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
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
    resetButtonText: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 15
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 50,
    },
    row: {
        flexDirection: 'row',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    closeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#FFF1F1',
    },
    closeText: {
        color: '#FF6B6B',
        fontWeight: '700',
        fontSize: 14,
    },
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
    optionText: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#FF6B6B',
        fontWeight: '700',
    },
});

export default AddStudentScreen;