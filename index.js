
/**
 * MY SENDBIRD INFO
 */
const APP_ID = 'WRITE HERE YOUR APP ID FROM SENDBIRD';
const USER_ID = 'ENTER ONE OF YOUR USER ID HERE';
const ACCESS_TOKEN = null; // Use this if your user has Access Token (check this from your Sendbird Dashboard)

/**
 * Unique hanlder for listener (can be any string you like)
 */
const UNIQUE_HANDLER_ID = '1234567890';

/**
 *  Where group channels will be listed in your HTML
 */
const group_channels_list = document.getElementById('group_channels_list');

/**
 *  Where your messages will be listed in your HTML
 */
const message_list = document.getElementById('message_list');

/**
 * Variables to keep track of selected data
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
            prevMessageListQuery.reverse = false;
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

        /**
         * Button to show URL having access token: -> https://....?auth=XXX
         */
        const getPlainUrlButton = item.messageType == 'file' ? `
        <button class="btn btn-outline-primary btn-sm mr-3" onclick="getPlainUrl('${ item.messageId }')">
            Get Plain URL
        </button>` : ``;

        /**
         * Show reactions and a button next to each one saying "Remove"
         */
        const reactions = item.reactions;
        const totalReactions = reactions.length + ' reactions.';
        var strRections = ``;
        for (const r of reactions) {
            try {
                strRections += `${ String.fromCodePoint( r.key ) } `
                strRections += `&nbsp;
                <button class="btn btn-outline-primary btn-sm" onclick="deleteReaction('${ item.messageId }', '${ r.key }')">
                    Remove
                </button> &nbsp; `;    
            } catch(err) {}
        }

        /**
         * Button to add a reaction
         */
        const butAddReaction = `
        <button class="btn btn-outline-primary btn-sm" onclick="addReaction('${ item.messageId }')">
            Add reaction
        </button>`;

        messagesDiv.innerHTML += `
            <a href="#" class="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col">
                        ${ item.message }
                        <div class="small text-muted">
                            ${ item.messageType } - ${ totalReactions } 
                            <div>
                                ${ strRections }
                            </div>
                        </div>
                    </div>
                    <div class="col-auto">
                        ${ getPlainUrlButton }
                        ${ butAddReaction }
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
    const emojiKey = '' + "😃".codePointAt(0);
    const message = lastMessageList.find( item => item.messageId == messageId);
    lastChannelSelected.addReaction(message, emojiKey, (reactionEvent, error) => {
        if (!error) {
            message.applyReactionEvent(reactionEvent);
            alert('Reaction added. Refresh to see it here.');
        } else {
            console.dir(error);
        }
    });
}

function deleteReaction(messageId, emojiKey = '😃') {
    if (!lastChannelSelected || !lastMessageList) {
        alert('Please select a channel first');
        return;
    }
    const message = lastMessageList.find( item => item.messageId == messageId);
    lastChannelSelected.deleteReaction(message, emojiKey, (reactionEvent, error) => {
        if (!error) {
            alert('Reaction removed. Refresh to see it dissapear');
        } else {
            console.dir(error);
        }
    });
}

/**
 * Shows on console the URL with an access token
 * https://...?auth=XXX
 */
function getPlainUrl(messageId) {
    if (!lastChannelSelected || !lastMessageList) {
        alert('Please select a channel first');
        return;
    }
    const message = lastMessageList.find( item => item.messageId == messageId);    
    const plainUrl = message.url;
    console.log(plainUrl);
}


/**
 * https://sendbird.com/docs/chat/v3/javascript/guides/group-channel#1-group-channel
 */
function createGroupChannel() {
    /**
     * Get input-text with the channel name
     */
    const groupChannelName = document.getElementById('newGroupChannelName');
    /**
     * Create parameters 
     */    
    var params = new sb.GroupChannelParams();
    params.isPublic = true;
    params.isEphemeral = false;
    params.isDistinct = false;
    params.isSuper = false;
    params.addUserIds([USER_ID]);
    params.name = groupChannelName.value;
    /**
     * Create group channel
     */
    sb.GroupChannel.createChannel(params, (groupChannel, error) => {
        if (error) {
            console.dir(error);
        } else {
            groupChannelName.value = '';
            reloadLeftList();
        }
    });
}

/**
 * https://sendbird.com/docs/chat/v3/javascript/guides/open-channel#2-create-a-channel
 */
function createNewOpenChannel() {
    /**
     * Get input-text with the channel name
     */
    const openChannelName = document.getElementById('newOpenChannelName');
    /**
     * Create parameters 
     */    
    var params = new sb.OpenChannelParams();
    params.name = openChannelName.value;
    params.operatorUserIds = [USER_ID];
    /**
     * Create channel
     */
    sb.OpenChannel.createChannel(params, function(openChannel, error) {
        if (error) {
            console.dir(error);
        } else {
            openChannelName.value = '';
            reloadLeftList();
        }
    });
}


function reloadLeftList() {
    getGroupChannels(() => {
        getOpenChannels();
    });
}

