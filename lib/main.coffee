{CompositeDisposable,File,Directory} = require 'atom'
navUpdate = require './navUpdate'
creator = require './creator'
contents = require './contents'

module.exports =

    subscriptions: {}

    activate: (state) ->
        @subscriptions = new CompositeDisposable()
        @updateNav('watchDir')

        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:updateNav': => @updateNav('updateNav')
        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:create': => @createWiki()
        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:contents': => @makeContents()
        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:pasteImg': => @pasterImg()

    destroy: ->
        @subscriptions.dispose()

    updateNav: (type) ->
        editor = atom.workspace.getActiveTextEditor()
        return unless editor
        grammar = editor.getGrammar()
        return unless grammar
        return unless grammar.scopeName is 'source.gfm'
        if type == 'updateNav'
            navUpdate.updateNav(editor.getPath())
        else if type == 'watchDir'
            navUpdate.watchDir(editor.getPath())

    createWiki: ->
        editor = atom.workspace.getActiveTextEditor()
        return unless editor
        # console.log(atom);
        creator.buildAt(editor.getPath(), atom.configDirPath)

    makeContents: ->
        editor = atom.workspace.getActiveTextEditor()
        return unless editor
        grammar = editor.getGrammar()
        return unless grammar
        return unless grammar.scopeName is 'source.gfm'
        ct = contents.make(editor.getPath()) or ''
        @insertText ct, editor

    pasterImg: ->
        # console.log('pasterImg')
        editor = atom.workspace.getActiveTextEditor()
        return unless editor
        grammar = editor.getGrammar()
        return unless grammar
        return unless grammar.scopeName is 'source.gfm'

        return unless editor.getPath().substr(-3) is '.md'

        clipboard = require 'clipboard'
        img = clipboard.readImage()

        return if img.isEmpty()

        # e.stopImmediatePropagation()

        imgbuffer = img.toPng()

        thefile = new File(editor.getPath())

        if thefile.getParent().getParent().getBaseName() is 'library'
            assetsDirPath = thefile.getParent().getParent().getParent().getPath()+"/assets"
            creatDirPath = assetsDirPath+'/'+thefile.getParent().getBaseName()
            writePath = assetsDirPath+'/'+thefile.getParent().getBaseName()+'/'
            insertPath = thefile.getParent().getBaseName()+'/'
        else 
            if thefile.getParent().getBaseName() is 'library'
                assetsDirPath = thefile.getParent().getParent().getPath()+"/assets"
                creatDirPath = assetsDirPath+'/'
                writePath = assetsDirPath+'/'
                insertPath = ''
            else 
                return

        crypto = require "crypto"
        md5 = crypto.createHash 'md5'
        md5.update(imgbuffer)

        filename = "#{thefile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g,'')}-#{md5.digest('hex').slice(0,5)}.png"

        @createDirectory creatDirPath, ()=>
            @writePng writePath, filename, imgbuffer, ()=>
                # ascClip = "assets/#{filename}"
                # clipboard.writeText(ascClip)

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
        fs.writeFile assetsDir+filename, buffer, 'binary',() =>
            # console.log('finish clip image')
            callback()

    insertText: (url, editor) ->
        editor.insertText(url)

    deactivate: ->

    serialize: ->
