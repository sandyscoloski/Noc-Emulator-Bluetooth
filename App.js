import React from 'react';
import { StyleSheet, Text, View, Button, FlatList,
        Switch, TouchableOpacity, ToastAndroid } from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial';

export default class App extends React.Component {
    constructor (props) {
        super (props)

        this.state = {
            isEnabled: false,
            discovering: false,
            devices: [],
            unpairedDevices: [],
            connected: false,
        }
    }

    discoverAvaliableDevices() {
        if (this.state.discovering) {
            return false
        }

        this.setState({ discovering: true })

        BluetoothSerial.discoverUnpairedDevices()
        .then((unpairedDevices) => {
            const uniqueDevices = _.uniqBy(unpairedDevices, 'id')
            console.log(uniqueDevices)
            this.setState({ unpairedDevices: uniqueDevices, discovering: false })
        })
        .catch((err) => console.log(err.message))
    }

    toggleBluetooth(value) {
        if (value === true) {
            this.enable()
        } else {
            this.disable()
        }
    }

    enable() {
        BluetoothSerial.enable()
        .then((res) => this.setState({ isEnabled: true }))
        .catch((err) => Toast.showShortBottom(err.message))
    }

    disable() {
        BluetoothSerial.disable()
        .then((res) => this.setState({ isEnabled: false }))
        .catch((err) => Toast.showShortBottom(err.message))
    }

    activeGreenLed() {
        BluetoothSerial.write('0')
        .then((res) => {
        console.log(res)
        console.log('Successfuly wrote to device')
        this.setState({ connected: true })
        })
        .catch((err) => console.log(err.message))
    }

    activeRedLed() {
        BluetoothSerial.write('1')
        .then((res) => {
            console.log(res)
            console.log('Successfuly wrote to device')
            this.setState({ connected: true })
        })
        .catch((err) => console.log(err.message))
    }

    connect(device) {
        this.setState({ connecting: true })

        BluetoothSerial.connect(device.id)
        .then((res) => {
            console.log(`Connected to device ${device.name}`)
            ToastAndroid.show(`Connected to device ${device.name}`, ToastAndroid.SHORT)
        })
        .catch((err) => console.log((err.message)))
    }

    componentWillMount() {
        Promise.all([
            BluetoothSerial.isEnabled(),
            BluetoothSerial.list()
            ])
        .then((values) => {
            const [isEnabled, devices] = values
            this.setState({ isEnabled, devices })
        })

        BluetoothSerial.on('bluetoothEnabled', () => {
            Promise.all([
                BluetoothSerial.isEnabled(),
                BluetoothSerial.list()
            ])
            .then((values) => {
                const [ devices ] = values
                this.setState({ devices })
            })

            BluetoothSerial.on('bluetoothDisabled', () => {
                this.setState({ devices: [] })
            })

            BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))
        })
    }

  renderDevices(item) {
        return (
            <TouchableOpacity onPress={() => this.connect(item.item)}>
                <View style={styles.deviceNameWrap}>
                        <Text style={styles.deviceName}>
                            { item.item.name ? item.item.name : item.item.id }
                        </Text>
                    </View>
                </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <Text style={styles.tooblarTitle}>Bluetooth Device List</Text>
                    <View style={styles.toolbarButton}>
                        <Switch
                            value={this.state.isEnabled}
                            onValueChange={(val) => this.toggleBluetooth(val)}
                        />
                    </View>
                </View>

                <Button
                    onPress={this.discoverAvaliableDevices.bind(this)}
                    title='Scan for Devices'
                    color='#841584'
                />

                <FlatList
                    style={{flex: 1}}
                    data={this.state.devices}
                    keyExtractor={item => item.id}
                    renderItem={(item) => this.renderDevices(item)}
                />

                <Button
                    onPress={this.activeGreenLed.bind(this)}
                    title='Green'
                    color='#287731'
                />

                <Button
                    onPress={this.activeRedLed.bind(this)}
                    title='Red'
                    color='#aa3443'
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    toolbar: {
        paddingTop: 30,
        paddingBottom: 30,
        flexDirection: 'row'
    },
    toolbarButton: {
        width: 50,
        marginTop: 8,
    },
    tooblarTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        flex: 1,
        marginTop: 6,
    },
    deviceName: {
        fontSize: 17,
        color: 'black',
    },
    deviceNameWrap: {
        margin: 10,
        borderBottomWidth: 1,
    }
})
