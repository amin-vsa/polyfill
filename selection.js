// Script variables - loaded-in by mfaInit()

var action = undefined;
var themeId = undefined;

var methods = []

// OTP Type
var otpTypeEmail = undefined;
var otpTypeEmailLink = undefined;
var otpTypeSMS = undefined;
var otpTypeVerify = undefined;
var otpTypeTotp = undefined;
var otpTypeKQ = undefined;
var otpTypeFido2 = undefined;
var otpTypeVoiceOTP = undefined;

var otpTypeLabelObj = undefined;

// OTP Action
var otpActionEmail = undefined;
var otpActionEmailLink = undefined;
var otpActionSMS = undefined;
var otpActionVerfiy = undefined;
var otpActionTotp = undefined;
var otpActionKQ = undefined;
var otpActionFido2 = undefined;
var otpActionVoiceOTP = undefined;

var otpActionLabelObj = undefined;

// Custom 'onload' event handler
function mfaInit() {
	// Collect variables' values
	action = document.getElementsByName("action")[0].content;
	themeId = document.getElementsByName("themeId")[0].content;
	if (typeof themeId === "undefined" || themeId === null 
		|| (typeof themeId === "string" && themeId.trim().length === 0)) {
		themeId = "default";
	}

	// OTP Type
	otpTypeEmail = document.getElementsByName("otpTypeEmail")[0].content;
	otpTypeSMS = document.getElementsByName("otpTypeSMS")[0].content;
	otpTypeVerify = document.getElementsByName("otpTypeVerify")[0].content;
	otpTypeTotp = document.getElementsByName("otpTypeTotp")[0].content;
	otpTypeKQ = document.getElementsByName("otpTypeKQ")[0].content;
	otpTypeFido2 = document.getElementsByName("otpTypeFido2")[0].content;
	otpTypeVoiceOTP = document.getElementsByName("otpTypeVoiceOTP")[0].content;

	var otpTypeEmailLinkDoc = document.getElementsByName("otpTypeEmailLink")
	if (otpTypeEmailLinkDoc != null && otpTypeEmailLinkDoc.length != 0) {
		otpTypeEmailLink = otpTypeEmailLinkDoc[0].content;
	} else {
		otpTypeEmailLink = "Email Link";
	}

	otpTypeLabelObj = {
		email: otpTypeEmail,
		emailLink: otpTypeEmailLink,
		sms: otpTypeSMS,
		verify: otpTypeVerify,
		totp: otpTypeTotp,
		kq: otpTypeKQ,
		fido2: otpTypeFido2
	};
	// to make sure backward compatibility
	if (typeof otpTypeVoiceOTP !== 'undefined') {
		otpTypeLabelObj['voiceotp'] = otpTypeVoiceOTP;
	}

	// OTP Action
	otpActionEmail = document.getElementsByName("otpActionEmail")[0].content;
	otpActionSMS = document.getElementsByName("otpActionSMS")[0].content;
	otpActionVerfiy = document.getElementsByName("otpActionVerfiy")[0].content;
	otpActionTotp = document.getElementsByName("otpActionTotp")[0].content;
	otpActionKQ = document.getElementsByName("otpActionKQ")[0].content;
	otpActionFido2 = document.getElementsByName("otpActionFido2")[0].content;
	otpActionVoiceOTP = document.getElementsByName("otpActionVoiceOTP")[0].content;

	var otpActionEmailLinkDoc = document.getElementsByName("otpTypeEmailLink")
	if (otpActionEmailLinkDoc != null && otpActionEmailLinkDoc.length != 0) {
		otpActionEmailLink = otpActionEmailLinkDoc[0].content;
	} else {
		otpActionEmailLink = "Send Link";
	}

	otpActionLabelObj = {
		email: otpActionEmail,
		emailLink: otpActionEmailLink,
		sms: otpActionSMS,
		verify: otpActionVerfiy,
		totp: otpActionTotp,
		kq: otpActionKQ,
		fido2: otpActionFido2,
		smsotp: otpActionSMS,
		hotp: otpActionTotp,
		push: otpActionVerfiy,
		emailotp: otpActionEmail
	};
	// to make sure backward compatibility
	if (typeof otpActionVoiceOTP !== 'undefined') {
		otpActionLabelObj['voiceotp'] = otpActionVoiceOTP;
	}

	/**
	 * method object interface:
	 * {
	 * 	methodLabel: string
	 * 	methodType: string
	 * 	methodId: string
	 *  groupId: string
	 *  groupLabel: string
	 *  capability: string
	 * }
	 */
	const otpMethods = document.getElementsByName("otpMethod");

	for (let currentIndex = 0; currentIndex < otpMethods.length; currentIndex++) {
        let content = otpMethods[currentIndex].getAttribute('content').split('|');

        let method = {};
        method.methodLabel = content[0];
        method.methodId = content[1];
        method.methodType = content[2].split('_')[0];
        method.groupId = content[3];
        method.groupLabel = content[4];
        method.capability = content[5];
        methods.push(method);
    }
	document.getElementById("combined-form").action = buildTemplateFormAction("", action, themeId)

	// Clear countdown(OTP timer) session storage
	sessionStorage.removeItem('timeRemaining')
	sessionStorage.removeItem('navigationTime')


	/**
	 * Build an object (methodMap) that has all groups of methods by type, 
	 * and each method for each group that's available
	 * 
	 * Interface:
	 * {
	 *	 [methodType: string]: {
	* 		methodTypeLabel: string;
	* 		methods: {
	* 			methodLabel: string;
	* 			methodActionLabel: string;
	* 			methodId: string;
	* 		}[];
	* 	 }
	* }
	*/
	var methodMap = {}
	var i
	for (i = 0; i < methods.length; i++) {
		var methodType;
		var groupLabel;
		var capability;
		if (methods[i].methodType == "mfaprovider") {
			methodType = methods[i].groupId;
			groupLabel = methods[i].groupLabel;
			capability = methods[i].capability;
		} else {
			methodType = methods[i].methodType;
			groupLabel = getMethodTypeLabel(methods[i].methodType);
			capability = methods[i].methodType;
		}
		if (Object.keys(methodMap).indexOf(methodType) === -1) {
			methodMap[methodType] = {
				methodTypeLabel: groupLabel,
				methods: [{
					methodLabel: methods[i].methodLabel,
					methodActionLabel: getMethodActionLabel(capability),
					methodId: methods[i].methodId
				}]
			}
		} else {
			methodMap[methodType].methods.push({
				methodLabel: methods[i].methodLabel,
				methodActionLabel: getMethodActionLabel(capability),
				methodId: methods[i].methodId
			})
		}
	}

	// Generate OTP Methods HTML
	// for each method type (email, sms, push, etc)
	var methodContainers = document.getElementById('method-containers')
	Object.keys(methodMap).forEach(function (methodType) {
		var methodContainer = document.createElement('div')
		methodContainer.classList.add('method-container')
		methodContainers.appendChild(methodContainer)
		var node = document.createElement('h6')
		var textNode = document.createTextNode(methodMap[methodType].methodTypeLabel)
		node.appendChild(textNode)

		if (methodType != 'kq') {
			methodContainer.appendChild(node)
		}
		node = document.createElement('ul')
		node.classList.add('method-list')
		methodContainer.appendChild(node)
		//for each method of this type (push device 1, push device 2, etc)
		var i
		var currentMethods = methodMap[methodType].methods
		for (i=0; i<currentMethods.length; i++) {
			var liNode = document.createElement('li')
			liNode.classList.add('method-item')
			node.appendChild(liNode)
			var methodNameNode
			if (methodType == 'kq') {
				methodNameNode = document.createElement('h6')
			} else {
				methodNameNode = document.createElement('div')
			}
			var methodActionNode = document.createElement('a')
			methodNameNode.classList.add('method-name')
			methodActionNode.classList.add('method-action')
			var att = document.createAttribute('href')
			att.value = '#'
			methodActionNode.setAttributeNode(att)
			att = document.createAttribute('data-ci-key')
			att.value = currentMethods[i].methodId
			methodActionNode.setAttributeNode(att)
			methodActionNode.addEventListener('click', submit, false);
			methodActionNode.idParam = currentMethods[i].methodId;
			if (methodType == 'kq') {
				textNode = document.createTextNode(methodMap[methodType].methodTypeLabel)
			} else {
				textNode = document.createTextNode(currentMethods[i].methodLabel)
			}
			methodNameNode.appendChild(textNode)
			textNode = document.createTextNode(currentMethods[i].methodActionLabel)
			methodActionNode.appendChild(textNode)
			liNode.appendChild(methodNameNode)
			liNode.appendChild(methodActionNode)
		}
	})

}
window.addEventListener("load", mfaInit)

function getMethodTypeLabel(methodType) {
	return otpTypeLabelObj[methodType] || methodType;
}

function getMethodActionLabel(methodType) {
	return otpActionLabelObj[methodType] || methodType;
}

function submit(event) {
	event.preventDefault()
	event.stopPropagation()
	document.getElementById("delivery-selection-input").value = event.currentTarget.idParam
	document.getElementById("combined-form").submit()
}

function closeHelpModal(event) {
	event.preventDefault()
	document.getElementById('help-modal-container').classList.remove('is-visible')
}

function openHelpModal(event) {
	event.preventDefault()
	document.getElementById('help-modal-container').classList.add('is-visible')
}


