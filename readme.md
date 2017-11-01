**!important: Before create chat, owner need to be register with domain, than guest can create new chat**

###Api endpoints for auth chat owner
**path: /owner/login**
* method: POST
* require: email, password}
* return: `{
               "statusCode": code,
               "status": success/error,
               "data":{
                   "ownerId": id,
                   "token": {token,
                   "level": level
               }
           }`

**path: /owner/register**
* method: POST
* require: email, password, domain
* return:`{
              "statusCode": code,
              "status": success/error,
              "data": message
          }`

**path: /owner/logout**
* method: POST
* require: token
* return: `{
                "statusCode": code,
                "status": success/error,
                "data": message
            }`

###Api endpoints for chats

**getNewChat** can call guest

    let email = 'email@mail.com';
    let name = 'Name';
    let domain = 'localhost';
    socket.emit('getNewChat', {
        email: email,
        name: name,
        domain: domain
    });
return: guestToken, chatId, guestId

**newMessage** can call guest/owner

    let chatId = '59f708172b16261fc0165f54';
    let token = '277b7bb0c61d0c6d840c64a123c28a0e';
    socket.emit('newMessage', {
        chatId: chatId,
        token: token,
        message: 'hi'
    });
return: status, statusCode, system message

**getChatMessages** can call guest/owner

    let chatId = '59f708172b16261fc0165f54';
    let token = '277b7bb0c61d0c6d840c64a123c28a0e';
    socket.emit('getChatMessages', {
        chatId: chatId,
        token: token,
        limit: 10,
        skip: 0,
    });

return status, statusCode, messages

**getActiveChats** can call owner

    let token = '528f3b47c1191f99d008d02774bcc7a4';
    socket.emit('getActiveChats', {
        token: token,
    });

return status, statusCode, chats ids

**getWaitingChats** can call owner

    let token = '528f3b47c1191f99d008d02774bcc7a4';
    socket.emit('getWaitingChats', {
        token: token,
    });

return status, statusCode, chats ids


