import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomTabNavigator = ({ state, navigation }: any) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const tabs = [
        {
            name: 'Home',
            icon: 'home',
            iconOutline: 'home-outline',
            label: 'Home',
            route: 'HomeTab'
        },
        {
            name: 'Students',
            icon: 'people',
            iconOutline: 'people-outline',
            label: 'Students',
            route: 'StudentsTab'
        },
        {
            name: 'Rooms',
            icon: 'bed',
            iconOutline: 'bed-outline',
            label: 'Rooms',
            route: 'RoomsTab'
        },
        {
            name: 'Finance',
            icon: 'wallet',
            iconOutline: 'wallet-outline',
            label: 'Finance',
            route: 'FinanceTab'
        }
    ];

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.tabsContainer}>
                {tabs.map((tab, index) => {
                    // Check if state.routes[state.index] matches or if we need to find by name
                    const currentRoute = state.routes[state.index];
                    const isActive = currentRoute.name === tab.route;

                    const handleTabPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: tab.route,
                            canPreventDefault: true,
                        });

                        if (!isActive && !event.defaultPrevented) {
                            navigation.navigate(tab.route);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.tabItem}
                            onPress={handleTabPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={(isActive ? tab.icon : tab.iconOutline) as any}
                                size={24}
                                color={isActive ? '#FF6B6B' : '#94A3B8'}
                            />
                            {isActive && <View style={styles.activeDot} />}
                            <Text
                                style={[
                                    styles.label,
                                    {
                                        color: isActive ? '#FF6B6B' : '#94A3B8',
                                        fontWeight: isActive ? '700' : '500'
                                    }
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FF6B6B',
        marginTop: 4,
        marginBottom: 2
    },
    label: {
        fontSize: 10,
        marginTop: 0,
    },
});

export default BottomTabNavigator;
