# PlantPal

**PlantPal** is a smart plant monitoring and watering application built with React Native and Expo. Connect your plants to IoT hardware devices and monitor their health from anywhere in the world.

## Current Version: 1.0.0

### Version History
- **v1.0.0** (Current) - Initial release
  - Real-time plant monitoring
  - Remote watering functionality
  - User account management
  - Garden management

##  Features

- **Real-time Plant Monitoring**: Track soil moisture, temperature, and humidity levels
- **Remote Watering**: Water your plants from anywhere with a single tap
- **User Accounts**: Secure personal accounts to manage your plants and devices
- **IoT Integration**: Seamless connection with hardware devices placed in your plants
- **Plant Management**: Add, edit, and organize your plants with ease

##  Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go app](https://expo.dev/client) on your mobile device (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/plantpal.git
cd plantpal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your device:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `a` for Android emulator or `i` for iOS simulator

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory and add your configuration:

```env
API_BASE_URL=your_api_endpoint
FIREBASE_API_KEY=your_firebase_key
# Add other environment variables as needed
```

### Hardware Setup

To connect your PlantPal hardware device:
1. Ensure your harware device is powered on and connected to WiFi
2. Open the app and navigate to "Add Plant"
3. Follow the on-screen pairing instructions
4. Assign the device to a specific plant in your garden

## Project Structure

```
plantpal/
├── assets/          # Images, fonts, and other static assets
├── components/      # Reusable React components
├── screens/         # App screens/pages
├── navigation/      # Navigation configuration
├── utils/           # Helper functions and utilities
├── App.js           # Main app component
└── package.json     # Dependencies and scripts
```

## Built With

- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - Development platform
- [React Navigation](https://reactnavigation.org/) - Routing and navigation
<!-- Add other major libraries you're using -->

## Features in Detail

### Plant Monitoring
- **Soil Moisture**: Real-time moisture level percentage
- **Temperature**: Current temperature readings in Celsius/Fahrenheit
- **Humidity**: Ambient humidity levels around your plant

### Remote Control
- Trigger watering cycles remotely via the app

### User Management
- Create personal accounts
- Secure authentication
- Manage multiple devices and plants


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Prashaxt** - *Initial work* - [Prashaxt](https://github.com/Prashaxt)

## Future Enhancements

- [ ] Auto-Watering for the plants
- [ ] Weather-based watering recommendations
- [ ] Community features to share plant care tips
- [ ] Integration with more IoT devices
- [ ] Plant health analysis using AI
- [ ] Historical data visualization
- [ ] Plant identification using camera

---
