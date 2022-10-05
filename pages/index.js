import {readFileSync, writeFileSync} from '../utils/fs.js'
import auth from '../utils/auth.js'

const { messageBuilder } = getApp()._options.globalData

Page({
	state: {
		scrollList: null,
		otpList: null,
		dataList: readFileSync(),
	},

	onMessage() {
		messageBuilder.on('call', ({ payload: buf }) => {
			this.state.dataList = messageBuilder.buf2Json(buf)
			this.updateList()
		})
	},
	getAccountList() {
		messageBuilder
			.request({ method: 'GET_ACCOUNT_LIST' })
			.then(({ result }) => {
				this.state.dataList = result
				this.updateList()
			})
			.catch((res) => { })
	},
	updateList() {
		const { dataList } = this.state
		var otpList = [{ name: 'Authenticator' }]
		dataList.forEach(function (item) {
			var authObj = new auth(item.account, item.secret, item.issuer)
			var otp = authObj.getOtp()
			otp = otp.slice(0, 3) + ' ' + otp.slice(3)

			otpList.push({
				account: item.account,
				issuer: item.issuer,
				otp: otp,
				authObj: authObj,
			})
		})
		otpList.push({ name: '' })

		this.state.otpList = otpList

		this.state.scrollList.setProperty(hmUI.prop.UPDATE_DATA, {
			data_array: this.state.otpList,
			data_count: this.state.otpList.length,
			data_type_config: [
				{
					start: 0,
					end: 0,
					type_id: 2,
				},
				{
					start: 1,
					end: this.state.otpList.length - 2,
					type_id: 1,
				},
				{
					start: this.state.otpList.length - 1,
					end: this.state.otpList.length - 1,
					type_id: 2,
				},
			],
			data_type_config_count: 3,
			on_page: 1,
		})
	},
	createList() {
		const deviceInfo = hmSetting.getDeviceInfo()
		const dWidth = deviceInfo.width
		const dHeight = deviceInfo.height
		const cardWidth = dWidth * 0.8

		this.state.scrollList = hmUI.createWidget(hmUI.widget.SCROLL_LIST, {
			x: dWidth * 0.1,
			y: 0,
			w: cardWidth,
			h: dHeight,
			item_space: 20,
			item_config: [
				{
					type_id: 1,
					item_height: 200,
					item_bg_color: 0x404040,
					item_bg_radius: 20,
					text_view: [
						{
							x: cardWidth * 0.05,
							y: 0,
							w: cardWidth * 0.9,
							h: 70,
							color: 0xffffff,
							key: 'issuer',
							text_size: 40,
							align_h: hmUI.align.LEFT,
						},
						{
							x: cardWidth * 0.05,
							y: 57,
							w: cardWidth * 0.9,
							h: 45,
							color: 0xaaaaaa,
							key: 'account',
							text_size: 25,
							align_h: hmUI.align.LEFT,
						},
						{
							x: cardWidth * 0.05,
							y: 90,
							w: cardWidth * 0.9,
							h: 90,
							color: 0xffffff,
							key: 'otp',
							text_size: px(85),
							align_h: hmUI.align.LEFT,
						},
					],
					text_view_count: 3,
				},
				{
					type_id: 2,
					item_height: 100,
					item_bg_color: 0x000000,
					item_bg_radius: 0,
					text_view: [
						{
							x: 0,
							y: 0,
							w: cardWidth,
							h: 100,
							color: 0xffffff,
							key: 'name',
							text_size: 45,
							align_h: hmUI.align.CENTER_H,
							align_v: hmUI.align.BOTTOM,
						},
					],
					text_view_count: 1,
				},
			],
			item_config_count: 2,
			data_array: [],
			data_count: 0,
		})
		this.updateList()
	},
	createArc() {
		const deviceInfo = hmSetting.getDeviceInfo()
		const dWidth = deviceInfo.width
		const dHeight = deviceInfo.height
		const jsTime = hmSensor.createSensor(hmSensor.id.TIME)
		const elapsedSec = jsTime.second % 30
		let otpExpiryTime = jsTime.utc - elapsedSec + 30
		const arcBg = hmUI.createWidget(hmUI.widget.ARC, {
			x: 0,
			y: 0,
			w: dWidth,
			h: dHeight,
			start_angle: 210,
			end_angle: 150,
			color: 0x641002,
			line_width: 15
		})
		const arc = hmUI.createWidget(hmUI.widget.ARC, {
			x: 0,
			y: 0,
			w: dWidth,
			h: dHeight,
			start_angle: 210 - 2 * elapsedSec,
			end_angle: 150,
			color: 0xfc6950,
			line_width: 15
		})
		setInterval(() => {
			const currentSec = jsTime.second
			const elapsedSec = currentSec % 30
			const start_angle = 210 - 2 * elapsedSec
			arc.setProperty(hmUI.prop.MORE, {start_angle: start_angle})
			if (jsTime.utc > otpExpiryTime) {
				otpExpiryTime = jsTime.utc - elapsedSec + 30;
				this.updateList()
			}
		}, 1000);
	},
	onInit() {
		this.onMessage()
		this.getAccountList()
	},
	build() {
		this.createList()
		this.createArc()
	},
	onDestory() {
		writeFileSync(this.state.dataList, false)
	},
})
