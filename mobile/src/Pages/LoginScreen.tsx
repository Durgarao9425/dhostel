import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Dimensions,
    ScrollView,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
    const { signIn } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Ref to scroll view so we can scroll to password field when focused
    const scrollRef = useRef<ScrollView>(null);
    const passwordRef = useRef<TextInput>(null);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!identifier || !password) {
            setErrorMessage('Please enter both Email/Phone and Password');
            return;
        }
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const { error, user } = await signIn(identifier, password);
            if (!error && user) {
                navigation.navigate('Main');
            } else {
                setErrorMessage(error || 'Invalid credentials');
            }
        } catch (err: any) {
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // When password field is focused, scroll down so it is always visible
    const onPasswordFocus = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 300); // wait for keyboard animation to start
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // On Android 'height' shrinks the available space properly
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                    {/* Top gradient header */}
                    <LinearGradient
                        colors={['#FF7B7B', '#FF6B6B']}
                        style={styles.topSection}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBadge}>
                                <Text style={styles.logoText}>S</Text>
                            </View>
                            <Text style={styles.appName}>StayNow</Text>
                            <Text style={styles.tagline}>Smart Hostel Management</Text>
                        </View>
                    </LinearGradient>

                    {/* Form — ScrollView so fields scroll above keyboard */}
                    <ScrollView
                        ref={scrollRef}
                        style={styles.formSection}
                        contentContainerStyle={styles.formContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                        // This is the key fix: scroll view adjusts its
                        // content inset automatically when keyboard shows
                        scrollEnabled={true}
                    >
                        <Text style={styles.signInTitle}>Sign in</Text>

                        {/* Error alert */}
                        {errorMessage && (
                            <View style={styles.alertBox}>
                                <Ionicons name="warning" size={18} color="#FF6B6B" />
                                <Text style={styles.alertText}>{errorMessage}</Text>
                            </View>
                        )}

                        {/* Email / Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email or Phone</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Email or Phone"
                                    placeholderTextColor="#B8B8B8"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={identifier}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                    blurOnSubmit={false}
                                    onChangeText={(text) => {
                                        setIdentifier(text);
                                        if (errorMessage) setErrorMessage(null);
                                    }}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="••••••••••"
                                    placeholderTextColor="#B8B8B8"
                                    value={password}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                    onFocus={onPasswordFocus}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errorMessage) setErrorMessage(null);
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color="#9E9E9E"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && { opacity: 0.8 }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#FF7B7B', '#FF6B6B']}
                                style={styles.loginGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Login</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Extra bottom padding so button is never hidden by keyboard */}
                        <View style={styles.keyboardSpacer} />
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    topSection: {
        height: height * 0.32,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoBadge: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 50,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    appName: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 15,
        color: '#FFFFFF',
        opacity: 0.95,
        fontWeight: '400',
    },
    // Form
    formSection: {
        flex: 1,
    },
    formContent: {
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: 20,
        // flexGrow ensures ScrollView fills remaining height
        // so short content doesn't look odd on large screens
        flexGrow: 1,
    },
    signInTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 20,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
    },
    alertText: {
        fontSize: 13,
        color: '#FF6B6B',
        marginLeft: 10,
        flex: 1,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 16,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#000000',
        fontWeight: '400',
        paddingVertical: 12,
        borderWidth: 0,
        ...Platform.select({
            web: {
                outlineWidth: 0,
                outlineStyle: 'none',
                boxShadow: 'none',
            } as any,
        }),
    },
    eyeButton: {
        padding: 4,
    },
    loginButton: {
        height: 54,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 16,
    },
    loginGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // This spacer ensures the login button is never hidden behind the keyboard
    keyboardSpacer: {
        height: 120,
    },
});

export default LoginScreen;