import { getFormmatedDate, getFormmatedTime, Fullmonth, weekDays } from '../configs/dateConfigs'


export const getMsgTime = (timestamps) => {

    let date = new Date(timestamps);
    return getFormmatedTime(date)
}

export const getMessageDay = (msgTimestamps) => {
    const msgFulldate = new Date(msgTimestamps);

    let msgdate = msgFulldate.getDate()
    let currFulldate = new Date()

    if (msgFulldate.getFullYear() !== currFulldate.getFullYear() || msgFulldate.getMonth() !== currFulldate.getMonth()) {
        return getFormmatedDate(msgFulldate);
    }
    else {

        let currdate = currFulldate.getDate()

        let dayDiff = currdate - msgdate;

        if (dayDiff === 0) return "Today"
        else if (dayDiff === 1) return "Yesterday"
        else if (dayDiff < 7) return weekDays[msgFulldate.getDay()]
        else return msgdate + " " + Fullmonth[msgFulldate.getMonth()];
    }

}

export const isFirstMsgOfTheDay = (msgTimestamp, messages, i) => {

    let msgDay = (new Date(msgTimestamp)).getDate()
    let msgMonth = (new Date(msgTimestamp)).getMonth()


    if (messages[i - 1]) {

        let preMsgDay = (new Date(messages[i - 1].createdAt)).getDate()
        let preMsgMonth = (new Date(messages[i - 1].createdAt)).getMonth()

        if (messages[i + 1]) {

            let nextMsgDay = (new Date(messages[i + 1].createdAt)).getDate()

            if (preMsgMonth === msgMonth && msgDay !== preMsgDay && msgDay === nextMsgDay) {

                return true
            }
            else if (preMsgMonth !== msgMonth && msgDay === preMsgDay && msgDay === nextMsgDay) return true
            else if (msgDay !== preMsgDay && msgDay !== nextMsgDay) return true

        } else {
            if (msgDay !== preMsgDay) return true
        }

    }
    else return true
}

export const isLastMsgOfTheDay = (msgTimestamp, messages, i) => {

    let msgFulldate = new Date(msgTimestamp)
    let msgdate = msgFulldate.getDate()
    if (messages[i + 1]) {
        let nextMsgFulldate = new Date(messages[i + 1].createdAt)
        let nextMsgdate = nextMsgFulldate.getDate()
        if (msgdate !== nextMsgdate) return true
    }

}

export const islastRegularMsgOfSender = (messages, i, senderId) => {
    return (messages[i + 1] === undefined || (messages[i + 1].sender._id === senderId && messages[i + 1].msgType === 'info'))
}

export const isFirstUnseenMessage = (m, messages, i, user) => {
    if (messages.length) {

        if (!m.seenBy.includes(user._id)) {
            if (messages[i - 1]) {
                if (messages[i - 1].seenBy.includes(user?._id)) return true
            }

            else if (messages.length === 1) return true

            // else if (!messages[i + 1].seenBy.includes(user?._id)) return true

        }
    }
}

export const islastMsgOfSender = (messages, i, senderId) => {

    return (messages[i + 1] === undefined || messages[i + 1].sender._id !== senderId)

}