import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    ScrollView,
    StatusBar,
    Alert,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Wrench,
    Plus,
    Filter,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronLeft,
    X,
    Calendar,
    DollarSign,
    Search,
    Trash2
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
// import { useAuth } from '../../contexts/AuthContext'; // If needed for user info

// Mock Data for Issues
const MOCK_ISSUES = [
    {
        id: '1',
        room: '204',
        title: 'Fan Not Working',
        category: 'Electrical',
        priority: 'High',
        status: 'Open',
        date: '2024-02-15',
        cost: '500'
    },
    {
        id: '2',
        room: '101',
        title: 'Leaking Tap',
        category: 'Plumbing',
        priority: 'Medium',
        status: 'In Progress',
        date: '2024-02-14',
        cost: '200'
    },
    {
        id: '3',
        room: '305',
        title: 'Broken Chair',
        category: 'Furniture',
        priority: 'Low',
        status: 'Resolved',
        date: '2024-02-10',
        cost: '0'
    },
    {
        id: '4',
        room: '202',
        title: 'Wall Paint Peeling',
        category: 'Paint',
        priority: 'Low',
        status: 'Open',
        date: '2024-02-16',
        cost: '1500'
    }
];

const CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'Pest', 'Paint', 'Cleaning', 'Door/Lock', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const MaintenanceScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const [issues, setIssues] = useState(MOCK_ISSUES);
    const [filter, setFilter] = useState('All');
    const [addModalVisible, setAddModalVisible] = useState(false);

    // Handle deep link / notification
    React.useEffect(() => {
        if (route.params?.issueId) {
            const issueId = route.params.issueId;
            const found = issues.find(i => i.id === issueId);
            if (found) {
                setTimeout(() => {
                    setViewIssue(found);
                    setDrawerVisible(true);
                }, 500);
            } else {
                Alert.alert("Maintenance Update", "New maintenance issue received: " + issueId);
            }
        }
    }, [route.params]);

    // View Details / Right Drawer State
    const [viewIssue, setViewIssue] = useState<any>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // Form State
    const [newIssue, setNewIssue] = useState({
        room: '',
        category: 'Electrical',
        title: '',
        description: '',
        priority: 'Medium',
        cost: ''
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return '#EF4444';
            case 'In Progress': return '#F59E0B';
            case 'Resolved': return '#10B981';
            default: return '#64748B';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#EF4444'; // Red
            case 'Medium': return '#F97316'; // Orange
            case 'Low': return '#3B82F6'; // Blue
            default: return '#64748B';
        }
    };

    const getPriorityBg = (priority: string) => {
        switch (priority) {
            case 'High': return '#FEF2F2';
            case 'Medium': return '#FFF7ED';
            case 'Low': return '#EFF6FF';
            default: return '#F8FAFC';
        }
    };

    const filteredIssues = useMemo(() => {
        if (filter === 'All') return issues;
        return issues.filter(i => i.status === filter);
    }, [issues, filter]);

    const stats = useMemo(() => {
        return {
            'All': issues.length,
            'Open': issues.filter(i => i.status === 'Open').length,
            'In Progress': issues.filter(i => i.status === 'In Progress').length,
            'Resolved': issues.filter(i => i.status === 'Resolved').length
        };
    }, [issues]);

    const handleAddIssue = () => {
        if (!newIssue.title || !newIssue.room) {
            Alert.alert('Error', 'Please fill in Room and Title');
            return;
        }

        const issue = {
            id: Date.now().toString(),
            ...newIssue,
            status: 'Open',
            date: new Date().toISOString().split('T')[0]
        };

        setIssues([issue, ...issues]);
        setAddModalVisible(false);
        setNewIssue({
            room: '',
            category: 'Electrical',
            title: '',
            description: '',
            priority: 'Medium',
            cost: ''
        });
    };

    const markResolved = (id: string) => {
        setIssues(issues.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));
        if (viewIssue && viewIssue.id === id) {
            setViewIssue({ ...viewIssue, status: 'Resolved' });
        }
    };

    const openIssueDetails = (issue: any) => {
        setViewIssue(issue);
        setDrawerVisible(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color="#FFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Maintenance</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {/* Full Width Filter Tabs with Counts */}
            <View style={styles.filterContainer}>
                {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.filterTab,
                            filter === tab && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setFilter(tab)}
                    >
                        <Text style={[
                            styles.filterText,
                            filter === tab && { color: '#FFF' }
                        ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {tab === 'In Progress' ? 'Prog' : tab} <Text style={{ fontSize: 10, opacity: 0.8 }}>({stats[tab as keyof typeof stats]})</Text>
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Issue List */}
            <FlatList
                data={filteredIssues}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() => openIssueDetails(item)}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.roomBadge}>
                                <Text style={styles.roomText}>Room {item.room}</Text>
                            </View>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityBg(item.priority) }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                    {item.priority}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardCategory}>{item.category}</Text>

                        <View style={styles.cardFooter}>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status}
                                </Text>
                            </View>
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Wrench size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No issues found</Text>
                    </View>
                }
            />

            {/* FAB Add Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => setAddModalVisible(true)}
            >
                <Plus color="#FFF" size={30} />
            </TouchableOpacity>

            {/* Add Issue Modal */}
            <Modal
                visible={addModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Issue</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <Text style={styles.label}>Room Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 204"
                                value={newIssue.room}
                                onChangeText={t => setNewIssue({ ...newIssue, room: t })}
                            />

                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Issue Title"
                                value={newIssue.title}
                                onChangeText={t => setNewIssue({ ...newIssue, title: t })}
                            />

                            <Text style={styles.label}>Category</Text>
                            <View style={styles.pillContainer}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.optionPill,
                                            newIssue.category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
                                        ]}
                                        onPress={() => setNewIssue({ ...newIssue, category: cat })}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            newIssue.category === cat && { color: '#FFF' }
                                        ]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.pillContainer}>
                                {PRIORITIES.map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.optionPill,
                                            newIssue.priority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) }
                                        ]}
                                        onPress={() => setNewIssue({ ...newIssue, priority: p })}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            newIssue.priority === p && { color: '#FFF' },
                                            newIssue.priority !== p && { color: getPriorityColor(p) }
                                        ]}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Cost Estimate (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={newIssue.cost}
                                onChangeText={t => setNewIssue({ ...newIssue, cost: t })}
                            />
                        </ScrollView>

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleAddIssue}>
                            <Text style={styles.saveBtnText}>Save Issue</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Right Side Drawer for View Details */}
            <Modal
                visible={drawerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setDrawerVisible(false)}
            >
                <View style={styles.drawerOverlay}>
                    <TouchableOpacity
                        style={styles.drawerBackdrop}
                        activeOpacity={1}
                        onPress={() => setDrawerVisible(false)}
                    />

                    <View style={styles.drawerContent}>
                        {viewIssue && (
                            <>
                                <View style={styles.drawerHeader}>
                                    <Text style={styles.drawerTitle}>Issue Details</Text>
                                    <TouchableOpacity onPress={() => setDrawerVisible(false)} style={styles.drawerCloseBtn}>
                                        <X color="#1E293B" size={24} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerScroll}>
                                    <View style={styles.drawerSection}>
                                        <Text style={styles.drawerLabel}>STATUS</Text>
                                        <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(viewIssue.status) }]}>
                                            <Text style={styles.statusTextLarge}>{viewIssue.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.drawerRow}>
                                        <View style={styles.drawerCol}>
                                            <Text style={styles.drawerLabel}>ROOM</Text>
                                            <Text style={styles.drawerValue}>Room {viewIssue.room}</Text>
                                        </View>
                                        <View style={styles.drawerCol}>
                                            <Text style={styles.drawerLabel}>PRIORITY</Text>
                                            <Text style={[styles.drawerValue, { color: getPriorityColor(viewIssue.priority) }]}>
                                                {viewIssue.priority}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.drawerSection}>
                                        <Text style={styles.drawerLabel}>ISSUE</Text>
                                        <Text style={styles.drawerMainText}>{viewIssue.title}</Text>
                                        <Text style={styles.categoryTag}>{viewIssue.category}</Text>
                                    </View>

                                    {viewIssue.description ? (
                                        <View style={styles.drawerSection}>
                                            <Text style={styles.drawerLabel}>DESCRIPTION</Text>
                                            <Text style={styles.drawerDescText}>{viewIssue.description}</Text>
                                        </View>
                                    ) : null}

                                    <View style={styles.drawerSection}>
                                        <Text style={styles.drawerLabel}>REPORTED ON</Text>
                                        <Text style={styles.drawerValue}>{viewIssue.date}</Text>
                                    </View>

                                    {viewIssue.cost ? (
                                        <View style={styles.drawerSection}>
                                            <Text style={styles.drawerLabel}>ESTIMATED COST</Text>
                                            <Text style={styles.costText}>₹{viewIssue.cost}</Text>
                                        </View>
                                    ) : null}

                                    {viewIssue.status !== 'Resolved' && (
                                        <TouchableOpacity
                                            style={styles.resolveBtnLarge}
                                            onPress={() => {
                                                markResolved(viewIssue.id);
                                                setDrawerVisible(false);
                                            }}
                                        >
                                            <CheckCircle size={20} color="#FFF" />
                                            <Text style={styles.resolveTextLarge}>Mark as Resolved</Text>
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    statCard: { flex: 1, padding: 10, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minHeight: 80 },
    statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    statValue: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
    statLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', textAlign: 'center' },

    filterContainer: { flexDirection: 'row', padding: 10, gap: 5 },
    filterTab: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
    filterText: { fontSize: 11, color: '#64748B', fontWeight: '700' },

    listContent: { paddingHorizontal: 16, paddingBottom: 100 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    roomBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    roomText: { fontSize: 12, fontWeight: '700', color: '#475569' },
    priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    priorityText: { fontSize: 11, fontWeight: '800' },

    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    cardCategory: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '700' },
    dateText: { fontSize: 12, color: '#94A3B8' },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#94A3B8', fontSize: 16, fontWeight: '600' },

    fab: { position: 'absolute', bottom: 130, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },

    // Add Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: '90%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    formScroll: { maxHeight: 500 },
    label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#F1F5F9' },
    pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
    optionText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    saveBtn: { padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 30 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    // Right Drawer Styles -> Converted to Bottom Sheet
    drawerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' },
    drawerBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
    drawerContent: { width: '100%', backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingVertical: 30, paddingHorizontal: 20, maxHeight: '90%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    drawerCloseBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
    drawerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    drawerScroll: { paddingBottom: 40 },

    drawerSection: { marginBottom: 24 },
    drawerLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 6, letterSpacing: 0.5 },

    drawerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    drawerCol: { flex: 1 },

    drawerValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    drawerMainText: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    drawerDescText: { fontSize: 15, color: '#64748B', lineHeight: 22 },

    categoryTag: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '600', color: '#64748B' },
    statusBadgeLarge: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
    statusTextLarge: { color: '#FFF', fontWeight: '800', fontSize: 13 },

    costText: { fontSize: 24, fontWeight: '900', color: '#1E293B' },

    resolveBtnLarge: { backgroundColor: '#10B981', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
    resolveTextLarge: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});

export default MaintenanceScreen;
