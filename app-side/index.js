import { MessageBuilder } from '../shared/message'

const messageBuilder = new MessageBuilder()

function getAccountList() {
	return settings.settingsStorage.getItem('accountList')
		? JSON.parse(settings.settingsStorage.getItem('accountList'))
		: []
}

AppSideService({
	onInit() {
		messageBuilder.listen(() => {})
		settings.settingsStorage.addListener(
			'change',
			({ key, newValue, oldValue }) => {
				messageBuilder.call(getAccountList())
			}
		)
		messageBuilder.on('request', (ctx) => {
			const payload = messageBuilder.buf2Json(ctx.request.payload)
			if (payload.method === 'GET_ACCOUNT_LIST') {
				ctx.response({ data: { result: getAccountList() } })
			}
		})
	},

	onRun() {},

	onDestroy() {},
})
