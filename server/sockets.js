module.exports = (server) => {
    const
        io = require('socket.io')(server),
        moment = require('moment')

    let users = []
    const messages = []

    // when the page is loaded in the browser the connection event is fired
    io.on('connection', socket => {

        // on making a connection - load in the content already present on the server
        socket.emit('refresh-messages', messages)
        socket.emit('refresh-users', users)

        socket.on('join-user', userName => {
            const user = {
                id: socket.id,
                name: userName,
                image:"https://robohash.org/"+userName+"?set=any"
            }

            let present = false
            for(let i=0;i<users.length;i++)
            {

              if(users[i].name.toUpperCase()=== userName.toUpperCase()){
                present = true
              }
            }
            if (present)
            {
              socket.emit('failed-join',user)
              return
            }

            users.push(user)
            io.emit('successful-join', user)


        })

        socket.on('send-message', data => {
            const content = {
                user: data.user,
                message: data.message,
                date: moment(new Date()).format('MM/DD/YY h:mm a'),
                image:data.image
            }
            //console.log(data)
            messages.push(content)

            io.emit('successful-message', content)
        })

        socket.on('disconnect', () => {
            users = users.filter(user => {
                return user.id != socket.id
            })

            io.emit('refresh-users', users)
        })
    })
}
