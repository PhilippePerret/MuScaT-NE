'use strict'

const t = (msg_id, repl) => {
  return ipc.sendSync('get-locale', {id: msg_id, replacements: repl})
}
