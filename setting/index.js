import { gettext } from 'i18n'
/*
{
    account
    secret
    issuer
    uri
}
*/
AppSettingsPage({
	state: {
		accountList: [],
		props: {},
	},
	uriToObj(uri) {
		const regx = /otpauth:\/\/totp\/(\S+)\?(\w+?=\w+)(?:&(\w+?=\w+))*/
		const matched = uri.match(regx)
		if (matched) {
			var obj = { uri: matched[0], account: matched[1] }
			for (let i = 2; i < matched.length; ++i) {
				let tmp = matched[i].split('=')
				obj[tmp[0]] = tmp[1]
			}
			return obj
		}
		return null
	},
	addAccountList(val) {
		var obj = this.uriToObj(val)
		if (obj) {
			this.state.accountList.push(obj)
			this.setItem()
		}
	},
	editAccountList(val, index) {
		var obj = this.uriToObj(val)
		this.state.accountList[index] = obj
		this.setItem()
	},
	deleteAccountList(index) {
		this.state.accountList = this.state.accountList.filter((_, ind) => {
			return ind !== index
		})
		this.setItem()
	},
	setItem() {
		const newStr = JSON.stringify(this.state.accountList)
		this.state.props.settingsStorage.setItem('accountList', newStr)
	},
	setState(props) {
        this.state.props = props

		if (props.settingsStorage.getItem('accountList')) {
			this.state.accountList = JSON.parse(
				props.settingsStorage.getItem('accountList')
			)
		} else {
			this.state.accountList = []
			console.log('Initilized')
		}
	},
	build(props) {
		this.setState(props)
        
		const contentItems = []

		const addButton = View(
			{
				style: {
					fontSize: '12px',
					borderRadius: '30px',
					background: '#409EFF',
					color: 'white',
					textAlign: 'center',
					padding: '10px 15px',
					width: '30%',
				},
			},
			[
				TextInput({
					label: 'Add URI',
					onChange: (val) => {
						this.addAccountList(val)
					},
				}),
			]
		)

		this.state.accountList.forEach((item, i) => {
			contentItems.push(
				View(
					{
						style: {
							borderBottom: '1px solid #eaeaea',
							padding: '6px 0',
							marginBottom: '6px',
							display: 'flex',
							flexDirection: 'row',
						},
					},
					[
						View(
							{
								style: {
									flex: 1,
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
								},
							},
							[
								TextInput({
									label: item.issuer,
									bold: true,
									value: item.uri,
									subStyle: {
										color: '#333',
										fontSize: '14px',
									},
									maxLength: 200,
									onChange: (val) => {
										if (val.length > 0 && val.length <= 200) {
											this.editAccountList(val, i)
										}
									},
								}),
							]
						),
						Button({
							label: 'del',
							style: {
								fontSize: '12px',
								borderRadius: '30px',
								background: '#D85E33',
								color: 'white',
							},
							onClick: () => {
								this.deleteAccountList(i)
							},
						}),
					]
				)
			)
		})

		return View(
			{
				style: {
					padding: '12px 20px',
				},
			},
			[
				addButton,
				contentItems.length > 0 &&
					View(
						{
							style: {
								marginTop: '12px',
								padding: '10px',
								border: '1px solid #eaeaea',
								borderRadius: '6px',
								backgroundColor: 'white',
							},
						},
						contentItems
					),
			]
		)
	},
})
