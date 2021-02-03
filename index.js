
/**
 * MY SENDBIRD INFO
 */
const APP_ID = 'WRITE HERE YOUR APP ID FROM SENDBIRD';
const USER_ID = 'ENTER ONE OF YOUR USER ID HERE';
const ACCESS_TOKEN = null; // Use this if your user has Access Token (check this from your Sendbird Dashboard)
const API_TOKEN = 'WRITE-YOUR-API-TOKEN-HERE';

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
    consolelog('onMessageReceived');
    consoledir(channel);
    consoledir(message);
};
channelHandler.onMessageUpdated = function(channel, message) {
    consolelog('onMessageUpdated:'); 
    consoledir(channel);
    consoledir(message);
};
channelHandler.onMessageDeleted = function(channel, messageId) {
    consolelog('onMessageDeleted:'); 
    consoledir(channel);
    consolelog(messageId);
};
channelHandler.onMentionReceived = function(channel, message) {
    consolelog('onMentionReceived:'); 
    consoledir(channel);
    consoledir(message);
};
channelHandler.onChannelChanged = function(channel) {
    consolelog('onChannelChanged:'); 
    consoledir(channel);
};
channelHandler.onChannelDeleted = function(channelUrl, channelType) {
    consolelog('onChannelDeleted:'); 
    consolelog(channelUrl);
    consolelog(channelType);
};
channelHandler.onChannelFrozen = function(channel) {
    consolelog('onChannelFrozen:'); 
    consoledir(channel);
};
channelHandler.onChannelUnfrozen = function(channel) {
    consolelog('onChannelUnfrozen:'); 
    consoledir(channel);
};
channelHandler.onMetaDataCreated = function(channel, metaData) {
    consolelog('onMetaDataCreated:'); 
    consoledir(channel);
    consoledir(metaData);
};
channelHandler.onMetaDataUpdated = function(channel, metaData) {
    consolelog('onMetaDataUpdated:'); 
    consoledir(channel);
    consoledir(metaData);
};
channelHandler.onMetaDataDeleted = function(channel, metaDataKeys) {
    consolelog('onMetaDataDeleted:'); 
    consoledir(channel);
    consoledir(metaDataKeys);
};
channelHandler.onMetaCountersCreated = function(channel, metaCounter) {
    consolelog('onMetaCountersCreated:'); 
    consoledir(channel);
    consoledir(metaCounter);
};
channelHandler.onMetaCountersUpdated = function(channel, metaCounter) {
    consolelog('onMetaCountersUpdated:'); 
    consoledir(channel);
    consoledir(metaCounter);
};
channelHandler.onMetaCountersDeleted = function(channel, metaCounterKeys) {
    consolelog('onMetaCountersDeleted:'); 
    consoledir(channel);
    consoledir(metaCounterKeys);
};
channelHandler.onChannelHidden = function(groupChannel) {
    consolelog('onChannelHidden:'); 
    consoledir(groupChannel);
};
channelHandler.onUserReceivedInvitation = function(groupChannel, inviter, invitees) {
    consolelog('onUserReceivedInvitation:'); 
    consoledir(groupChannel);
    consoledir(inviter);
    consoledir(invitees);
};
channelHandler.onUserDeclinedInvitation = function(groupChannel, inviter, invitee) {
    consolelog('onUserDeclinedInvitation:'); 
    consoledir(groupChannel);
    consoledir(inviter);
    consoledir(invitee);
};
channelHandler.onUserJoined = function(groupChannel, user) {
    consolelog('onUserJoined:'); 
    consoledir(groupChannel); 
    consoledir(user);
};
channelHandler.onUserLeft = function(groupChannel, user) {
    consolelog('onUserLeft:'); 
    consoledir(groupChannel);
    consoledir(user);
};
channelHandler.onDeliveryReceiptUpdated = function(groupChannel) {
    consolelog('onDeliveryReceiptUpdated:'); 
    consoledir(groupChannel);
};
channelHandler.onReadReceiptUpdated = function(groupChannel) {
    consolelog('onReadReceiptUpdated:'); 
    consoledir(groupChannel);
};
channelHandler.onTypingStatusUpdated = function(groupChannel) {
    consolelog('onTypingStatusUpdated:'); 
    consoledir(groupChannel);
};
channelHandler.onUserEntered = function(openChannel, user) {
    consolelog('onUserEntered:'); 
    consoledir(openChannel);
    consoledir(user);
};
channelHandler.onUserExited = function(openChannel, user) {
    consolelog('onUserExited:'); 
    consoledir(openChannel);
    consoledir(user);
};
channelHandler.onUserMuted = function(channel, user) {
    consolelog('onUserMuted:'); 
    consoledir(channel);
    consoledir(user);
};
channelHandler.onUserUnmuted = function(channel, user) {
    consolelog('onUserUnmuted:'); 
    consoledir(channel);
    consoledir(user);
};
channelHandler.onUserBanned = function(channel, user) {
    consolelog('onUserBanned:'); 
    consoledir(channel);
    consoledir(user);
};
channelHandler.onUserUnbanned = function(channel, user) {
    consolelog('onUserUnbanned:'); 
    consoledir(channel);
    consoledir(user);
};
sb.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);

/**
 * KEEP TRACK OF CONNECTED USER
 */
var connectedUser;


/**
 * START HERE - DEFAULT CONNECTION WITH GIVEN USER
 */
connectToSocket();



/**
 * CONNECT TO WEBSOCKET
 */
function connectToSocket() {
    sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
        console.log('Connected to Socket');
        consoledir(user);
        /**
         * Assign globally
         */
        connectedUser = user;
        /**
         * Show error or read channels
         */
        if (error) {
            consoledir(error);
            return;
        } else {
            getGroupChannels(() => {
                getOpenChannels();
            });
        }
    });    
}

/**
 * READ A DIFERENT USER ID AND RECONNECT
 */
function connectWithDifferentUser() {
    var newUserId = document.getElementById('newUserId').value;
    if (!newUserId) {
        return;
    }
    USER_ID = newUserId;
    sb.disconnect();
    setTimeout(() => {
        connectToSocket();
    })
}

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
            consolelog('Group Channels:');
            consoledir(groupChannels);
            if (error) {
                consolelog('Error getting Group Channels');
                consoledir(error);
                return;
            } else {
                clearLeftColumen();
                for (const item of groupChannels) {
                    consolelog('UNREAD MESSAGE COUNT FOR ' + item.name + '(' + item.url + ') : ' + item.unreadMessageCount);
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
                consolelog('Error getting Open Channels');
                consoledir(error);
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
        <a href="#" class="list-group-item list-group-item-action overflow-hidden" id="channel-${ channel.url }" onclick="listMessagesFromChannel('${ channel.url }')">
            ${ channel.name } <br>
            <small>${ channel.url }</small>
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
            consolelog('Error listing group channel messages:');
            consolelog(error);
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
                if (error) {
                    consolelog('Error listing messages for group channel:');
                    consoledir(error);
                    return;
                }
                consolelog('Messages:'); 
                consoledir(messages);
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
            consolelog('Error getting messages for Open Channel:'); 
            consolelog(error);
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
                consoledir(error);
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
                    consolelog('Errpr getting messages:');
                    consoledir(error);
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
    message_list.innerHTML = `<div class="list-group" id="messages"></div>`;
}

/**
 * DRAWS MESSAGES AT THE CENTER
 */
function paintMessagesAtTheCenter(messages) {
    const messagesDiv = document.getElementById('messages');
    for (const item of messages) {
        consoledir(item);
        var userId = '';
        if (item.sender) {
            userId = item.sender.userId;
        }
        /**
         * Button to show URL having access token: -> https://....?auth=XXX
         */
        const getPlainUrlButton = item.messageType == 'file' ? `
        <button class="btn btn-outline-primary btn-sm mr-3" onclick="getPlainUrl('${ item.messageId }')">
            Get Plain URL
        </button>` : ``;
        /**
         * Button to show get the file using Platform API
         */
        const downloadFileButton = item.messageType == 'file' ? `
        <button class="btn btn-outline-primary btn-sm mr-3" onclick="downloadFile('${ item.plainUrl }', '${ item.type }', '${ item.name }')">
            Download File
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
        /**
         * Button to get previous messages by ID
         */
        const butPrevMessagesById = lastChannelSelectedIsOpen ? '' : `
        <button class="btn btn-outline-primary btn-sm" onclick="getPreviousMessagesByIDGroupChannel('${ item.messageId }')">
            Get Prev Messages by ID
        </button>`;
        /**
         * Button for replying
         */
        const replyMessage = `<div class="mt-2 mb-2 row">
            <div class="col">
                <input type="text" class="form-control" id="replyText-${ item.messageId }" placeholder="Type your response..." />
            </div>
            <div class="col">
                <button class="btn btn-secondary btn-sm" onclick="replyTo('${ item.messageId }')">Reply</button>
            </div>
        </div>
        `;
        /**
         * Build a row of data
         */
        messagesDiv.innerHTML += `
            <a href="#" class="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col">
                        ${ item.message }
                        <div class="small text-muted">
                        ${ userId } - ${ item.messageType } - ${ totalReactions } 
                            <div>
                                ${ strRections }
                            </div>
                        </div>
                    </div>
                    <div class="col-auto">
                        ${ getPlainUrlButton }
                        ${ downloadFileButton }
                        ${ butAddReaction }
                        ${ butPrevMessagesById }
                    </div>
                </div>
                <div id="file-${ item.plainUrl }"></div>
                ${ replyMessage }
            </a>
        `;
    }
}

/**
 * Reply to a message
 */
function replyTo(messageId) {
    if (!lastChannelSelected) {
        alert('Please select a channel first');
        return;
    }
    const inputBox = document.getElementById('replyText-' + messageId);
    if (!inputBox.value) {
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
     * RESPOND TO MESSAGE
     */
    params.parentMessageId = messageId;
    /**
     * Send message
     */
    lastChannelSelected.sendUserMessage(params, (message, error) => {
        if (error) {
            consolelog('Error eplying to message:');
            consoledir(error);
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
 * SENDS A MESSAGE TO GROUP OR OPEN CHANNEL
 */
function sendMessage(translate = false) {
    if (!lastChannelSelected) {
        alert('Please select a channel first');
        return;
    }
    const inputBox = document.getElementById('newMessage');
    if (!inputBox.value) {
        consolelog('No message to send');
        return;
    }
    /**
     * Set message parameters
     */
    const params = new sb.UserMessageParams();
    params.message = inputBox.value;
    params.pushNotificationDeliveryOption = 'default';
    params.mentionType = 'users';
    if (translate) {
        params.translationTargetLanguages = ['vi'];   // << Set desired target language code
    }
    /**
     * Send message
     */
    lastChannelSelected.sendUserMessage(params, (message, error) => {
        if (error) {
            consolelog('Error sending message:');
            consoledir(error);
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
    /**
     * Get file object
     */
    const files = document.getElementById('attachFile').files;
    const file = files[0];
    /**
     * Print it on the Chrome console
     */
    consoledir(file);
    /**
     * Build parameters to send
     */
    const params = new sb.FileMessageParams();
    params.file = file;
    params.fileName = file.name;
    params.fileSize = file.size;
    params.mimeType = file.type;
    params.pushNotificationDeliveryOption = 'default';
    params.message = message;
    lastChannelSelected.sendFileMessage(params, (fileMessage, error) => {
        if (error) {
            consolelog('Error sending file message:');
            consoledir(error);
        } else {
            consolelog('Response:')
            consoledir(fileMessage);
            const inputBox = document.getElementById('newMessage');
            inputBox.focus();    
        }
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
    const emojiKey = '' + "😃".codePointAt(0); // << A bug was discovered thanks to this one here
    const message = lastMessageList.find( item => item.messageId == messageId);
    lastChannelSelected.addReaction(message, emojiKey, (reactionEvent, error) => {
        if (!error) {
            message.applyReactionEvent(reactionEvent);
            alert('Reaction added. Refresh to see it here.');
        } else {
            consolelog('Error sending reaction:');
            consoledir(error);
        }
    });
}

/**
 * REMOVES REACTION FROM MESSAGE
 */
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
            consolelog('Error removing reaction:');
            consoledir(error);
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
    consolelog(plainUrl);
}

/**
 * Using PlainUrl download this file
 */
function downloadFile(plainUrl, fileType, fileName) {
    var url = plainUrl;
    var headers = new Headers({
        'Api-Token': API_TOKEN
    });
    var options = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
    };
    var request = new Request(url);    
    fetch(request, options).then((response) => {
        consoledir(response);
        if (fileType.substring(0, 5) == 'image') {
            /**
             * If downloading image files
             */
            response.arrayBuffer().then((buffer) => {
                var base64Flag = 'data:' + fileType + ';base64,';
                var fileStr  = arrayBufferToBase64(buffer);
                document.getElementById('file-' + plainUrl).innerHTML = `<img src="${ base64Flag + fileStr }" style="height:100px;" />` ;
            });
        } else {
            /**
             * If you are downloading any other format
             * Let's say PDF or ZIP
             */
            const url = response.url;
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
        }
    });    
}

/**
 * Helper function
 */
function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
}

/**
 * https://sendbird.com/docs/chat/v3/javascript/guides/group-channel#1-group-channel
 */
function createGroupChannel(userIdToInvite = null) {
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
    var userIds = [USER_ID];
    if (userIdToInvite) {
        userIds.push(userIdToInvite);
    }
    params.addUserIds( userIds );
    params.name = groupChannelName.value;
    /**
     * Create group channel
     */
    sb.GroupChannel.createChannel(params, (groupChannel, error) => {
        if (error) {
            consolelog('Error creating group channel:');
            consoledir(error);
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
            consolelog('Error creating open channel:');
            consoledir(error);
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

/**
 * GET PREVIOUS MESSAGES BY ID IN GROUP CHANNEL
 */
function getPreviousMessagesByIDGroupChannel(messageId) {
    const prevLimit = 50;
    lastChannelSelected.getPreviousMessagesByID(
        parseInt(messageId),
        false,
        prevLimit,
        false,
        '',
        '',
        (prevMessages) => {
            for (let i = 0; i < prevMessages.length; i++) {
                consolelog('Previous Messages By ID: ');
                consoledir( prevMessages[i] );
                consolelog('--------------');
            }
        }
    )
}

/**
 * INVITE USER
 */
function inviteByUserId() {
    if (!lastChannelSelectedIsOpen) {
        const userId = prompt("Enter user id");
        if (!userId) {
            return;
        }
        var userIds = [userId];
        lastChannelSelected.inviteWithUserIds(userIds, function(response, error) {
            if (error) {
                consolelog('Error inviting user:');
                consoledir(error)
            }
            listMessagesFromChannel(lastChannelSelected.url);
        });    
    }
}

/**
 * CREATE GROUP CHANNEL AND INVITE USER BY ID
 */
function createGroupChannelAndInvite() {
    const userIdToInvite = document.getElementById('userIdToInvite').value;
    if (!userIdToInvite) {
        return;
    }
    createGroupChannel(userIdToInvite);
}


function consolelog(text) {
    console.log(text);
}

function consoledir(text) {
    console.dir(text);
}



