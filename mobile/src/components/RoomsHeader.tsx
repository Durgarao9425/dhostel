
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Search, Filter, Check, X } from 'lucide-react-native';

interface RoomsHeaderProps {
    search: string;
    setSearch: (text: string) => void;
    selectedFloor: string | null;
    onFilterPress: () => void;
    // filteredCount: number; // Removed to avoid passing dynamic number if not needed for input stability, but title needs it.
    // Actually passing primitives is fine.
    title: string;
    count: number;
}

export const RoomsHeader = ({ search, setSearch, selectedFloor, onFilterPress, title, count }: RoomsHeaderProps) => {
    return (
        <View style={styles.listHeader}>
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Search color="#999999" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search room number..."
                        placeholderTextColor="#999999"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, selectedFloor ? styles.filterButtonActive : null]}
                    onPress={onFilterPress}
                >
                    <Filter color={selectedFloor ? "#FFFFFF" : "#FF6B6B"} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {title}
                </Text>
                <Text style={styles.sectionCount}>{count} Rooms</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    listHeader: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: '#333333',
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterButtonActive: {
        backgroundColor: '#FF6B6B',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sectionCount: {
        fontSize: 13,
        color: '#666666',
    },
});
