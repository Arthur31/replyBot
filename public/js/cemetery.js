

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                             *
 *                                    Server                                   *
 *                                                                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


  // setTimeout(() => {
  //   if (socket.auth == undefined) {
  //     console.log('ban due to no auth');
  //     socket.disconnect(true)
  //   }else {
  //     console.log("--- Admin Connected ---");
  //   }
  // }, 500);

  // socket.on('SadminAuth', function (user, password) {
  //
  //     console.log("Login : " + user + ", Password : " + password);
  //
  //   Admin.findOne({ 'username': user, 'password' : password }, function (err, admin) {
  //     if (err) return handleError(err);
  //     if (admin == null) {
  //       console.log("invalid account");
  //       socket.emit('adminAuth', 'error');
  //       socket.disconnect(true);
  //       console.log('sorry');
  //     }
  //     if (admin) {
  //       socket.emit('adminAuth', 'sucess');
  //       // socket.join('secure admin', () => {
  //         socket.auth = 1;
  //       // });
  //     }
  //   });
  // });
