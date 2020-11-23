const c = require('chalk')
const path = require('path')
const fs = require('fs')
const youdao = require('../enginees/youdao')
const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath));
// const Translator = require('translator');

// const myTranslator = new Translator('../lang');

// myTranslator.language = 'en'

async function translate (cmd) {
  await youdao(cmd, config).then(res => {
    // console.log(res)
  }).catch(error => {
    throw error
  })
}

async function myEval(cmd, context, filename, callback) {
  const reg = new RegExp(/^\s*$/)
  if(reg.test(cmd)) {
    callback(null, '请输入有效单词')
    return
  }
  let result = await translate(cmd)
  // callback(null, myTranslator.translate('box.text'));
  callback(null, result)
}

function wrapRepl (args) {
  // console.log('args', args)
  const completeArgs = Object.assign({}, argsDefaults, args)
  const promptConfig = {
    ...completeArgs.prompt,
    makePrompt (flavor) {
      return `t-late: `
    }
  }
  const initialPrompt = promptConfig.makePrompt()
  // repl模块由repl.REPLServer类导出,该属性值为当前系统的路径分割符
  const customReplServer = completeArgs.replServer instanceof repl.REPLServer

  // repl.start([options])方法创建并启动一个repl.REPLServer实例,
  // 如果options为字符串,则指定了输入提示符
  const server = false ? completeArgs.replServer : repl.start({
    prompt: initialPrompt,  // 默认的输入提示符,默认为>
    replMode: completeArgs.useStrict ? repl.REPL_MODE_STRICT : repl.REPL_MODE_SLOPPY,
    eval: myEval,
    ignoreUndefined: true
    /*
    input: 输入要被读取的可读流,默认为process.stdin
    output: 输出要被写入的可写流,默认为process.sdout
    eval: 解释每行输入时使用的函数,默认为js eval()的异步封装,可以提供一个自定义的解释函数,本项目主要利用此属性实现定制化的repl应用
    useColors: 设置为true,表示write函数可以在repl输出中包含ansi颜色风格
    useGlobal: 设置为true,则解释函数使用js global作为上下文
    ignoreUndefined: 设置为true,输出器会忽略命令返回的undefined
    write: 写入到output之前,该函数被调用来格式化每个命令的输出,默认为util.inspect()
    replMode: 标志位,指定解释器使用的严格模式或者默认模式执行js命令,REPL_MODE_STRICT等同于每个repl声明前加上'use strict'
    更多方法查看repl.REPLServer()即可
     */
  })
  if(completeArgs.replServer) server.setPrompt(initialPrompt)

  return server
}

const argsSpec = require('yargs')
  .option('use_strict', {
    description: 'Activate strict mode',
    alias: ['use-strict', 's'],
    default: false,
    type: 'boolean'
  })

const argsDefaults = argsSpec.parse([])

// repl模块提供了读取-求值-输出的循环实现,node.js本身也使用repl作为执行js提供交互接口
const repl = require('repl')

function main (argv) {
  try {
    const args = argsSpec.parse(argv)
    wrapRepl(args)
  } catch (err) {
    console.error(c.bold.red(err.message))
    process.exit(1)
  }
}

module.exports = { main }
