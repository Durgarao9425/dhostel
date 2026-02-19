# StayNow Mobile App 🏠

StayNow is a modern, responsive mobile application for smart hostel and property management, built with Expo and React Native.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your mobile device

### Installation

1.  **Clone the repository** (if not already done)
2.  **Navigate to the mobile directory**:
    ```bash
    cd mobile
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Start the application**:
    ```bash
    npx expo start --tunnel
    ```

## 📂 Project Structure

```text
src/
├── assets/       # Static assets like images and icons
├── components/   # Reusable UI components (CustomButton, CustomInput)
├── navigation/   # Navigation configuration (Stack/Tab)
├── screens/      # Main application screens (Splash, Login, Home)
├── services/     # API and external services configuration
├── store/        # State management (Zustand)
└── theme/        # Global styling tokens (Colors, Spacing)
```

## 📱 Features
- **Splash Screen**: Animated entry with automatic navigation.
- **Login Screen**: Modern "wavy" design with secure inputs and loading states.
- **Dashboard**: Responsive grid layout with quick-action cards.
- **State Management**: Built-in authentication store using Zustand.
- **Theming**: Consistent design language across all platforms.

## 🛠 Tech Stack
- **Framework**: Expo / React Native
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **State**: Zustand
- **Networking**: Axios
- **Styling**: StyleSheet (Native)

## 🎨 Design Reference
The UI is inspired by modern management dashboards, using a soft salmon/pink primary color palette with clean typography and rounded architectural elements.
