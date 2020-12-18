
/**
 * MY INFO
 */
// const APP_ID = 'F96C99B3-6ED0-4AB2-8A0E-AF98C94B1EC4';
// const USER_ID = 'e9710233-934a-4e33-be6e-fafe572197bf';
// const ACCESS_TOKEN = '81899cc13bcd9077d0322b320d7a2089055f314f';

// WALTER's
const APP_ID = 'D1CB1742-A4A3-44B9-9E7F-126D14BAB34B';
const USER_ID = 'test1';
const ACCESS_TOKEN = null;

/**
 * More variables
 */
const UNIQUE_HANDLER_ID = '1234567890';
const group_channels_list = document.getElementById('group_channels_list');
const message_list = document.getElementById('message_list');

/**
 * AUX VARIABLES
 */
var lastChannelSelected;
var lastChannelSelectedIsOpen = false;
var lastMessageList;

/**
 * INIT SENDBIRD
 */
var sb = new SendBird({appId: APP_ID});

/**
 * ADD CHANNEL HANDLER
 */
var channelHandler = new sb.ChannelHandler();
channelHandler.onMessageReceived = function(channel, message) {
    console.log('Message received');
};
channelHandler.onMessageUpdated = function(channel, message) {};
channelHandler.onMessageDeleted = function(channel, messageId) {};
channelHandler.onMentionReceived = function(channel, message) {};
channelHandler.onChannelChanged = function(channel) {};
channelHandler.onChannelDeleted = function(channelUrl, channelType) {};
channelHandler.onChannelFrozen = function(channel) {};
channelHandler.onChannelUnfrozen = function(channel) {};
channelHandler.onMetaDataCreated = function(channel, metaData) {};
channelHandler.onMetaDataUpdated = function(channel, metaData) {};
channelHandler.onMetaDataDeleted = function(channel, metaDataKeys) {};
channelHandler.onMetaCountersCreated = function(channel, metaCounter) {};
channelHandler.onMetaCountersUpdated = function(channel, metaCounter) {};
channelHandler.onMetaCountersDeleted = function(channel, metaCounterKeys) {};
channelHandler.onChannelHidden = function(groupChannel) {};
channelHandler.onUserReceivedInvitation = function(groupChannel, inviter, invitees) {};
channelHandler.onUserDeclinedInvitation = function(groupChannel, inviter, invitee) {};
channelHandler.onUserJoined = function(groupChannel, user) {};
channelHandler.onUserLeft = function(groupChannel, user) {};
channelHandler.onDeliveryReceiptUpdated = function(groupChannel) {};
channelHandler.onReadReceiptUpdated = function(groupChannel) {};
channelHandler.onTypingStatusUpdated = function(groupChannel) {};
channelHandler.onUserEntered = function(openChannel, user) {};
channelHandler.onUserExited = function(openChannel, user) {};
channelHandler.onUserMuted = function(channel, user) {};
channelHandler.onUserUnmuted = function(channel, user) {};
channelHandler.onUserBanned = function(channel, user) {};
channelHandler.onUserUnbanned = function(channel, user) {};
sb.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);

/**
 * KEEP TRACK OF CONNECTED USER
 */
var connectedUser;


/**
 * CONNECT TO WEBSOCKET
 */
sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
    connectedUser = user;
    if (error) {
        return;
    } else {
        getGroupChannels(() => {
            getOpenChannels();
        });
    }
});

/**
 * LIST ALL GROUP CHANNELS
 */
function getGroupChannels(callback) {
    var channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    channelListQuery.includeEmpty = true;
    channelListQuery.order = 'latest_last_message';
    channelListQuery.limit = 100;
    channelListQuery.includeMetaArray = true;
    if (channelListQuery.hasNext) {
        channelListQuery.next((groupChannels, error) => {
            console.dir(groupChannels);
            if (error) {
                return;
            } else {
                clearLeftColumen();
                for (const item of groupChannels) {
                    drawGroupChannel(item);
                }
                callback();
            }
        });
    }
}

/**
 * LIST ALL OPEN CHANNELS
 */
function getOpenChannels() {
    var channelListQuery = sb.OpenChannel.createOpenChannelListQuery();
    channelListQuery.includeEmpty = true;
    channelListQuery.order = 'latest_last_message';
    channelListQuery.limit = 100;
    if (channelListQuery.hasNext) {
        channelListQuery.next((channels, error) => {
            if (error) {
                return;
            } else {
                for (const item of channels) {
                    drawOpenChannel(item);
                }
            }
        });
    }
}

/**
 * CLEAR LIST OF CHANNELS
 */
function clearLeftColumen() {
    group_channels_list.innerHTML = '<div class="list-group" id="channel_list"></div>';
}

/**
 * DRAW GROUP CHANNEL ON THE LEFT COLUMN
 */
function drawGroupChannel(channel) {
    document.getElementById('channel_list').innerHTML += `
        <a href="#" class="list-group-item list-group-item-action" id="channel-${ channel.url }" onclick="listMessagesFromChannel('${ channel.url }')">
            ${ channel.name }
        </a>
    `;
}

/**
 * DRAW OPEN CHANNEL ON THE LEFT COLUMN
 */
function drawOpenChannel(channel) {
    document.getElementById('channel_list').innerHTML += `
        <a href="#" class="list-group-item list-group-item-action" id="channel-${ channel.url }" onclick="listMessagesFromOpenChannel('${ channel.url }')">
            ${ channel.name } (OPEN CHANNEL)
        </a>
    `;
}

/**
 * LIST ALL MESSAGES FROM GROUP OR OPEN CHANNELS
 */
function listMessagesFromChannel(groupUrl) {
    sb.GroupChannel.getChannel(groupUrl, (groupChannel, error) => {
        if (error) {
            console.log(error);
            return;
        } else {
            /**
             * Set global variables
             */
            lastChannelSelected = groupChannel;
            lastChannelSelectedIsOpen = false;
            /**
             * List messages
             */
            var prevMessageListQuery = groupChannel.createPreviousMessageListQuery();
            prevMessageListQuery.limit = 100;
            prevMessageListQuery.reverse = true;
            prevMessageListQuery.includeMetaArray = true;
            prevMessageListQuery.includeReaction = true;
            prevMessageListQuery.load((messages, error) => {
                console.log('MESSAGES'); console.log(messages);
                if (error) {
                    return;
                }
                /**
                 * Set global variable
                 */
                lastMessageList = messages;
                /**
                 * Empty messages list
                 */
                emptyMessageList();
                /**
                 * Print the messages at the center
                 */
                paintMessagesAtTheCenter(messages);
            });        
        }    
    });
}

/**
 * LIST ALL MESSAGES FROM SELECTED OPEN CHANNEL
 */
function listMessagesFromOpenChannel(url) {
    sb.OpenChannel.getChannel(url, (channel, error) => {
        if (error) {
            console.log(error);
            return;
        }
        /**
         * Set global variables
         */
        lastChannelSelected = channel;
        lastChannelSelectedIsOpen = true;
        /**
         * Enter Open Channel
         */
        channel.enter((response, error) => {
            if (error) {
                alert('Error entering open channel!');
                return;
            }
            /**
             * Get messages
             */
            var prevMessageListQuery = channel.createPreviousMessageListQuery();
            prevMessageListQuery.limit = 100;
            prevMessageListQuery.reverse = true;
            prevMessageListQuery.includeMetaArray = true;
            prevMessageListQuery.includeReaction = true;
            prevMessageListQuery.load((messages, error) => {
                if (error) {
                    return;
                }
                /**
                 * Set global variable
                 */
                lastMessageList = messages;
                /**
                 * Empty messages list
                 */
                emptyMessageList();
                /**
                 * Print the messages at the center
                 */
                paintMessagesAtTheCenter(messages);
            });
        });
    });
}

/**
 * CLEARS THE AREA WHERE MESSAGES ARE SHOWN
 */
function emptyMessageList() {
    message_list.innerHTML = `
        <div class="list-group" id="messages">
        </div>
    `;
}

/**
 * DRAWS MESSAGES AT THE CENTER
 */
function paintMessagesAtTheCenter(messages) {
    const messagesDiv = document.getElementById('messages');
    for (const item of messages) {
        const totalReactions = item.reactions.length + ' reactions.';
        messagesDiv.innerHTML += `
            <a href="#" class="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col">
                        ${ item.message }
                        <div class="small text-muted">
                            ${ item.messageType } - ${ totalReactions } 
                        </div>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary btn-sm" onclick="addReaction('${ item.messageId }')">
                            Add reaction
                        </button>
                    </div>
                </div>
            </a>
        `;
    }
}

/**
 * SENDS A MESSAGE TO GROUP OR OPEN CHANNEL
 */
function sendMessage() {
    if (!lastChannelSelected) {
        alert('Please select a channel first');
        return;
    }
    const inputBox = document.getElementById('newMessage');
    if (!inputBox.value) {
        console.log('No message to send');
        return;
    }
    /**
     * Set message parameters
     */
    const params = new sb.UserMessageParams();
    params.message = inputBox.value;
    params.pushNotificationDeliveryOption = 'default';
    params.mentionType = 'users';
    /**
     * Send message
     */
    lastChannelSelected.sendUserMessage(params, (message, error) => {
        if (error) {
            console.dir(error);
            return;
        }
        if (lastChannelSelectedIsOpen) {
            listMessagesFromOpenChannel(lastChannelSelected.url);
        } else {
            listMessagesFromChannel(lastChannelSelected.url);
        }
        inputBox.value = '';
        inputBox.focus();
    });
}

/**
 * ASKS FOR A FILE MESSAGE TO SEND
 */
function askForFile() {
    document.getElementById('attachFile').click();
}

/**
 * SENDS A FILE MESSAGE TO CHANNEL
 */
function sendFileMessage(message = '') {
    const files = document.getElementById('attachFile').files;
    const file = files[0];
    console.dir(file);

    const params = new sb.FileMessageParams();
    params.file = file;             // Or .fileUrl  = FILE_URL (You can also send a file message with a file URL.)
    params.fileName = file.name;
    params.fileSize = file.size;
    params.mimeType = file.type;
    params.pushNotificationDeliveryOption = 'default';  // Either 'default' or 'suppress'
    params.message = message;
    lastChannelSelected.sendFileMessage(params, (fileMessage, error) => {
        if (error) {
            console.dir(error);
            return;
        }
        console.log(fileMessage);
        const inputBox = document.getElementById('newMessage');
        inputBox.focus();
    });
}

/**
 * ADD A REACTION TO A MESSAGE
 */
function addReaction(messageId) {
    if (!lastChannelSelected || !lastMessageList) {
        alert('Please select a channel first');
        return;
    }
    const emojiKey = "smile";
    const message = lastMessageList.find( item => item.messageId == messageId);
    lastChannelSelected.addReaction(message, emojiKey, (reactionEvent, error) => {
        if (!error) {
            message.applyReactionEvent(reactionEvent);
            alert('Reaction added');
        } else {
            console.dir(error);
        }
    });
}
