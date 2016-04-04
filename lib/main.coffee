{CompositeDisposable,File,Directory} = require 'atom'
navUpdate = require './navUpdate'
creator = require './creator'
contents = require './contents'

module.exports =

    subscriptions: {}

    activate: (state) ->
        @subscriptions = new CompositeDisposable()

        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:updateNav': => @updateNav()
        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:create': => @createWiki()
        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:contents': => @makeContents()
        @subscriptions.add atom.commands.add 'atom-workspace',
            'amWiki:pasteImg': => @pasterImg()

    destroy: ->
        @subscriptions.dispose()

    updateNav: ->
        editor = atom.workspace.getActiveTextEditor()
        return unless editor
        grammar = editor.getGrammar()
        return unless grammar
        return unless grammar.scopeName is 'source.gfm'
        navUpdate.updateNav(editor.getPath())

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

        return unless thefile.getParent().getParent().getBaseName() is 'library'

        assetsDirPath = thefile.getParent().getParent().getPath()+"/assets"

        crypto = require "crypto"
        md5 = crypto.createHash 'md5'
        md5.update(imgbuffer)

        filename = "#{thefile.getBaseName().replace(/\.\w+$/, '').replace(/\s+/g,'')}-#{md5.digest('hex').slice(0,5)}.png"

        @createDirectory assetsDirPath+'/'+thefile.getParent().getBaseName(), ()=>
            @writePng assetsDirPath+'/'+thefile.getParent().getBaseName()+'/', filename, imgbuffer, ()=>
                # ascClip = "assets/#{filename}"
                # clipboard.writeText(ascClip)

                @insertText "![](library/assets/#{thefile.getParent().getBaseName()}/#{filename})", editor

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
