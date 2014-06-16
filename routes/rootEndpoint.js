
/*
 * GET root endpoint
 */

exports.hello = function(req, res){
  res.send('{"msg":"hello", "games":["tetris","tic-tac-toe","peek-a-boo"]}');
};