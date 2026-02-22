import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Screens
import SplashScreen from '../Pages/SplashScreen';
import HomeScreen from '../Pages/HomeScreen';
import StudentsScreen from '../Pages/StudentsScreen';
import RoomsScreen from '../Pages/RoomsScreen';
import NotificationScreen from '../Pages/NotificationScreen';
import ProfileScreen from '../Pages/ProfileScreen';
import StudentDetailsScreen from '../Pages/StudentDetailsScreen';
import AddStudentScreen from '../Pages/AddStudentScreen';
import RoomDetailsScreen from '../Pages/RoomDetailsScreen';
import PaymentDetailsScreen from '../Pages/PaymentDetailsScreen';
import LoginScreen from '../Pages/LoginScreen';
import AddRoomScreen from '../Pages/AddRoomScreen';
import ExpenseScreen from '../Pages/ExpenseScreen';
import AddExpenseScreen from '../Pages/AddExpenseScreen';
import ExpenseDetailsScreen from '../Pages/ExpenseDetailsScreen';
import FeeManagementScreen from '../Pages/FeeManagementScreen';
import FeeCollectionScreen from '../Pages/FeeCollectionScreen';

import SettingsScreen from '../Pages/SettingsScreen';
import ReceiptScreen from '../Pages/ReciptScreen';
import IncomeScreen from '../Pages/InComeScreen';
import IncomeDetailsScreen from '../Pages/IncomeDetailsScreen';
import AddIncomeScreen from '../Pages/AddIncomeScreen';
import PlaceholderScreen from '../Pages/PlaceholderScreen';


import BottomTabNavigator from '../components/BottomTabNavigator';
import FinanceScreen from '../Pages/FinanceScreen';
import MaintenanceScreen from '../Pages/MaintenanceScreen';
import DeleteRoomsScreen from '../Pages/DeleteRoomsScreen';
import DeleteExpensesScreen from '../Pages/DeleteExpensesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={props => <BottomTabNavigator {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
            />
            <Tab.Screen
                name="StudentsTab"
                component={StudentsScreen}
            />
            <Tab.Screen
                name="RoomsTab"
                component={RoomsScreen}
            />
            {/* <Tab.Screen
                name="FeeManagementTab"
                component={FeeManagementScreen}
            /> */}
            <Tab.Screen
                name="FinanceTab"
                component={FinanceScreen}
            />
        </Tab.Navigator>
    );
};


import { useNavigationContainerRef } from '@react-navigation/native';
// import { notificationService } from '../services/notificationService';

// ... (other imports)

const AppNavigator = () => {
    const navigationRef = useNavigationContainerRef();

    // React.useEffect(() => {
    //     // Setup notification listeners
    //     const cleanup = notificationService.setupNotificationListeners((screen, params) => {
    //         if (navigationRef.isReady()) {
    //             // @ts-ignore - Dynamic navigation
    //             navigationRef.navigate(screen, params);
    //         }
    //     });
    //     return cleanup;
    // }, [navigationRef]);

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">

                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
                <Stack.Screen
                    name="AddStudent"
                    component={AddStudentScreen}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} />
                <Stack.Screen
                    name="AddRoom"
                    component={AddRoomScreen}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Expenses" component={ExpenseScreen} />
                <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
                <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
                <Stack.Screen name="FeeManagement" component={FeeCollectionScreen} />

                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Receipt" component={ReceiptScreen} />
                <Stack.Screen name="Income" component={IncomeScreen} />
                <Stack.Screen name="IncomeDetails" component={IncomeDetailsScreen} />
                <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
                <Stack.Screen name="Reports" component={PlaceholderScreen} initialParams={{ title: 'Analytics & Reports' }} />
                <Stack.Screen name="PersonalInfo" component={PlaceholderScreen} initialParams={{ title: 'Personal Information' }} />
                <Stack.Screen name="Themes" component={PlaceholderScreen} initialParams={{ title: 'Theme Settings' }} />
                <Stack.Screen name="Rooms" component={RoomsScreen} />
                <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
                <Stack.Screen name="DeleteRooms" component={DeleteRoomsScreen} />
                <Stack.Screen name="DeleteExpenses" component={DeleteExpensesScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
