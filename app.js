import './shared/device-polyfill'
import { MessageBuilder } from './shared/message'

const appDevicePort = 20
const appSidePort = 0
const appId = 1007250
const messageBuilder = new MessageBuilder({
	appId,
	appDevicePort,
	appSidePort,
})

App({
	globalData: {
		messageBuilder: messageBuilder,
	},
	onCreate() {
		messageBuilder.connect()
	},

	onDestroy() {
		messageBuilder.disConnect()
	},
})
