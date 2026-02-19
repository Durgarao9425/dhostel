import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const ReceiptScreen = ({ navigation, route }: any) => {
    const { feeData } = route.params || {};

    if (!feeData) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginTop: 100 }}>No Receipt Data Found</Text>
            </View>
        );
    }

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Calculate Next Due Date (Assume 1 month after current fee month or due date)
    const getNextDueDate = () => {
        if (feeData.due_date) {
            const dueDate = new Date(feeData.due_date);
            dueDate.setMonth(dueDate.getMonth() + 1);
            return dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return 'N/A';
    };

    const receiptData = {
        receiptNo: `REC-${feeData.fee_id}-${Date.now().toString().slice(-4)}`,
        student: `${feeData.first_name} ${feeData.last_name}`,
        room: feeData.room_number || 'N/A',
        amountPaid: feeData.paid_amount || 0,
        paymentMode: 'Online', // Or fetch from payments if available. For summary, it's mixed.
        date: formatDate(new Date().toISOString()), // Current date for receipt generation
        mobile: feeData.phone || 'N/A',
        nextDueDate: getNextDueDate(),
        month: feeData.fee_month
    };

    const generateHtml = () => {
        return `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                <style>
                  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background-color: #f9f9f9; }
                  .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #eee; }
                  .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                  .hostel-name { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
                  .receipt-title { font-size: 18px; color: #666; font-weight: 500; text-transform: uppercase; }
                  .meta { display: flex; justify-content: space-between; margin-bottom: 30px; color: #666; font-size: 14px; }
                  .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                  .details-table th, .details-table td { text-align: left; padding: 12px 15px; border-bottom: 1px solid #eee; }
                  .details-table th { color: #888; font-weight: 500; width: 40%; }
                  .details-table td { color: #333; font-weight: 600; text-align: right; }
                  .amount-row td { font-size: 18px; color: #2E7D32; border-top: 2px solid #eee; }
                  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; line-height: 1.6; }
                  .signature { margin-top: 50px; text-align: right; padding-right: 20px; }
                  .sign-line { border-top: 1px solid #ccc; display: inline-block; width: 200px; padding-top: 5px; font-weight: bold; color: #333; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="hostel-name">My Hostel</div>
                    <div class="receipt-title">Payment Receipt</div>
                  </div>
                  
                  <div class="meta">
                    <div><strong>Date:</strong> ${receiptData.date}</div>
                    <div><strong>Receipt No:</strong> ${receiptData.receiptNo}</div>
                  </div>
                  
                  <table class="details-table">
                    <tr>
                      <th>Student Name</th>
                      <td>${receiptData.student}</td>
                    </tr>
                    <tr>
                      <th>Room Number</th>
                      <td>${receiptData.room}</td>
                    </tr>
                    <tr>
                      <th>Mobile Number</th>
                      <td>${receiptData.mobile}</td>
                    </tr>
                    <tr>
                      <th>Fee Month</th>
                      <td>${receiptData.month}</td>
                    </tr>
                    <tr>
                      <th>Payment Mode</th>
                      <td>${receiptData.paymentMode}</td>
                    </tr>
                    <tr class="amount-row">
                      <th>Amount Paid</th>
                      <td>₹${receiptData.amountPaid.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <th>Next Due Date</th>
                      <td style="color: #F59E0B;">${receiptData.nextDueDate}</td>
                    </tr>
                  </table>
                  
                  <div class="signature">
                    <div class="sign-line">Authorized Signature</div>
                  </div>

                  <div class="footer">
                    <p>Thank you for your payment!</p>
                    <p>This is a computer generated receipt.</p>
                  </div>
                </div>
              </body>
            </html>
        `;
    };

    const sharePdf = async () => {
        try {
            const { uri } = await Print.printToFileAsync({ html: generateHtml() });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Share Receipt PDF' });
        } catch (error) {
            console.error('Error sharing PDF:', error);
            Alert.alert('Error', 'Failed to share PDF');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={['#FF7B7B', '#FF6B6B']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Receipt Details</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Receipt Card */}
                <View style={styles.receiptCard}>
                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Receipt No:</Text>
                        <Text style={styles.value}>{receiptData.receiptNo}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Student:</Text>
                        <Text style={styles.value}>{receiptData.student}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Mobile:</Text>
                        <Text style={styles.value}>{receiptData.mobile}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Room:</Text>
                        <Text style={styles.value}>{receiptData.room}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Amount Paid:</Text>
                        <Text style={styles.value}>₹{receiptData.amountPaid.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Generated On:</Text>
                        <Text style={styles.value}>{receiptData.date}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.receiptRow}>
                        <Text style={styles.label}>Next Due Date:</Text>
                        <Text style={[styles.value, { color: '#F59E0B' }]}>{receiptData.nextDueDate}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.downloadButton} onPress={sharePdf}>
                        <Ionicons name="download-outline" size={20} color="#666666" />
                        <Text style={styles.downloadText}>Save PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareButton} onPress={sharePdf}>
                        <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.shareText}>Share Receipt</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    receiptCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    label: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    downloadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    downloadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    shareButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#25D366',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    shareText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#BBBBBB',
    },
});

export default ReceiptScreen;