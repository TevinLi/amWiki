{CompositeDisposable,File,Directory} = require 'atom'
updateNav = require './updateNav'
autoNav = require './autoNav'
creator = require './creator'
contents = require './contents'

module.exports =

  subscriptions: null
  state: null

  activate: (state) ->
    console.log('amWiki-watchers: \n\r', state.libraryList);
    @state = state

    @subscriptions = new CompositeDisposable()
    @autoNav()

    @subscriptions.add atom.commands.add 'atom-workspace',
      'amWiki:updateNav': => @updateNav()
    @subscriptions.add atom.commands.add 'atom-workspace',
      'amWiki:create': => @createWiki()
    @subscriptions.add atom.commands.add 'atom-workspace',
      'amWiki:contents': => @makeContents()
    @subscriptions.add atom.commands.add 'atom-workspace',
      'amWiki:pasteImg': => @pasterImg()

  deactivate: ->
    autoNav.destroy @state.libraryList
    @subscriptions.dispose()

  serialize: ->
    libraryList: @state.libraryList

  updateNav: ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor
    grammar = editor.getGrammar()
    return unless grammar
    return unless grammar.scopeName is 'source.gfm'
    state = @state
    updateNav.refresh editor.getPath(), (path) ->
      i = 0
      hs = false
      console.log(path)
      while i < state.libraryList.length
        if state.libraryList[i] == path
          hs = true
        i++
      if (!hs)
        state.libraryList.push path

  autoNav: () ->
    state = @state
    autoNav.watchLibrary @state.libraryList, (list) ->
      state.libraryList = list

  createWiki: ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor
    state = @state
    creator.buildAt editor.getPath(), atom.configDirPath, (path) ->
      state.libraryList.push path

  makeContents: ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor
    grammar = editor.getGrammar()
    return unless grammar
    return unless grammar.scopeName is 'source.gfm'
    ct = contents.make(editor.getPath()) or ''
    @insertText ct, editor

  pasterImg: ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor
    grammar = editor.getGrammar()
    return unless grammar
    return unless grammar.scopeName is 'source.gfm'
    return unless editor.getPath().substr(-3) is '.md'

    clipboard = require 'clipboard'
    img = clipboard.readImage()
    return if img.isEmpty()
    imgbuffer = img.toPng()

    thefile = new File(editor.getPath())

    if thefile.getParent().getParent().getBaseName() is 'library'
      assetsDirPath = thefile.getParent().getParent().getParent().getPath() + "/assets"
      creatDirPath = assetsDirPath + '/' + thefile.getParent().getBaseName()
      writePath = assetsDirPath + '/' + thefile.getParent().getBaseName() + '/'
      insertPath = thefile.getParent().getBaseName() + '/'
    else
      if thefile.getParent().getBaseName() is 'library'
        assetsDirPath = thefile.getParent().getParent().getPath() + "/assets"
        creatDirPath = assetsDirPath + '/'
        writePath = assetsDirPath + '/'
        insertPath = ''
      else
        return

    crypto = require "crypto"
    md5 = crypto.createHash 'md5'
    md5.update(imgbuffer)

    filename = "#{thefile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g, '')}-#{md5.digest('hex').slice(0, 5)}.png"

    @createDirectory creatDirPath, ()=>
      @writePng writePath, filename, imgbuffer, ()=>
        @insertText "![](assets/#{insertPath}#{filename})", editor

    return false

  createDirectory: (dirPath, callback)->
    assetsDir = new Directory(dirPath)

    assetsDir.exists().then (existed) =>
      if not existed
        assetsDir.create().then (created) =>
          if created
            console.log 'Success Create dir'
            callback()
      else
        callback()

  writePng: (assetsDir, filename, buffer, callback)->
    fs = require('fs')
    fs.writeFile assetsDir + filename, buffer, 'binary', () =>
      callback()

  insertText: (url, editor) ->
    editor.insertText(url)
