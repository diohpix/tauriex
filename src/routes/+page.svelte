<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onDestroy, onMount } from "svelte";
    import {Terminal} from 'xterm'
    import { FitAddon } from 'xterm-addon-fit';
    import {WebglAddon} from 'xterm-addon-webgl'
    import 'xterm/css/xterm.css'
    import ansiEscapes from 'ansi-escapes';
    let shell = {
	    id: '1',
	    name: '12',
	    command: 'zsh',
	    args:[],
	    env: {},
	    icon: ''
    }
     
    let term:any;
    let fitAddon:any;
    let id:any;
    let unlisten:any;
    onMount(async ()=>{
        term = new Terminal({})
        fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new WebglAddon());
        term.options={"fontSize":12}
        term.open(document.getElementById('terminal')) 
        fitAddon.fit();
        let _composingStart = false;
        let _fromOndata= false;
    
        term.element.addEventListener('input',(e:InputEvent)=>{
            const key = e.data;
            const inputType =e.inputType;
            if(key !==null){
                const keyCode = key.charCodeAt(0);
                console.log(inputType,"key ",key,'start',_composingStart,keyCode)
                if( (keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203) ){
                    return
                }
                if(inputType ==='insertText'){  
                    if(_composingStart){
                        invoke('write_pty',{id,data:'\u001b[C'+key+'\u001b[D'})
                    }else{
                        invoke('write_pty',{id,data:key+'\u001b[D'})
                    }
                    _composingStart=true
                }else{
                    invoke('write_pty',{id,data:'\u001b[3~'+key+'\u001b[D'})
                    
                }
                _fromOndata=true
            }
            return true
        })
        term.element.addEventListener('keydown',(e:KeyboardEvent)=>{  
            const key = e.key;
            console.log('down',key,'compStart',_composingStart)
            if(_fromOndata){
                _fromOndata=false;
            }else{
                if(!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey)
                invoke('write_pty',{id,data:key})
            }
            return true
        })
        term.onData((data:any) => {
            _fromOndata=true
            const keyCode = data.charCodeAt(0)
            console.log('---- ondata ',data,'compStart',_composingStart,keyCode);
            if( (keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203) ){
                if(_composingStart){
                    invoke('write_pty',{id,data:'\u001b[C'+data})
                }else{
                    invoke('write_pty',{id,data})
                }
                _composingStart=false;
            }
        });
        
        unlisten = await listen('EVENTS:PTY:STDOUT', (event:any) => {
            id = event.payload.id
            const bytes = event.payload.bytes
            term.write(bytes)
        })
    })
    onDestroy(()=>{
        invoke('kill_pty',{id})
    })
    async function zsh(){
       var a= await invoke('spawn_pty',{shell});
       console.log('---------------shell---------------')
    }
    function resize(){
        fitAddon.fit();
        invoke('resize_pty',{id,size:{rows:120,cols:100,pixel_width:1024,pixel_height:1024}})
    }
    async function close(){
        invoke('kill_pty',{id})
        unlisten();
    }
    



    let composingStart = false;
    let fromOnData = false;
    function onInput(e:InputEvent){
        const key = e.data;
        const inputType =e.inputType;
        
        if(key !==null){
            const keyCode = key?.charCodeAt(0)
            var curpos=false
            if( (keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203) ){
                curpos = false
            }else{
                curpos = true
            }
            console.log('input',inputType,key,composingStart,curpos)
            if( inputType==='insertText' ){ 
                if(composingStart){ 
                    invoke('write_pty',{id,data:'\u001b[C'+key+'\u001b[D'})
                    console.log('pos1')
                }else{
                    if(curpos){
                        invoke('write_pty',{id,data:key+'\u001b[D'})
                        composingStart=true
                        console.log('pos2')
                    }else{
                        invoke('write_pty',{id,data:key})
                        composingStart=false
                        console.log('pos3')
                    }
                }
            }else{
                invoke('write_pty',{id,data:'\u001b[3~'+key+'\u001b[D'})
                console.log('pos4')
            }
           fromOnData=true
        }    
    }
    let cmd:any='';
    function keydown(e:KeyboardEvent){
        
        const key = e.key;
        console.log('keydown',key)
        if(key =="Enter"){
            invoke('write_pty',{id,data:'\x0D'})
            cmd=''
            return
        }
        if(key =="Backspace"){
            invoke('write_pty',{id,data:'\x08'})
            return
        }
        if(key =="Escape"){
            invoke('write_pty',{id,data:'\x1B'})
            return
        }
        if(key =="Delete"){
            invoke('write_pty',{id,data:'\x08'})
            return
        }
        if(key =="Tab"){
            invoke('write_pty',{id,data:'\t'})
            return
        }
        if(key =="ArrowUp"){
            ansiEscapes.cursorUp(1)
            invoke('write_pty',{id,data:ansiEscapes.cursorUp(1).replace('[1','[')})
            return
        }
        if(key =="ArrowDown"){
            ansiEscapes.cursorUp(1)
            invoke('write_pty',{id,data:ansiEscapes.cursorDown(1).replace('[1','[')})
            return
        }
        if(key =="ArrowLeft"){
            ansiEscapes.cursorUp(1)
            invoke('write_pty',{id,data:ansiEscapes.cursorBackward(1).replace('[1','[')})
            return
        }
        if(key =="ArrowRight"){
            ansiEscapes.cursorUp(1)
            invoke('write_pty',{id,data:ansiEscapes.cursorForward(1).replace('[1','[')})
            return
        }
        if(e.ctrlKey){
            if( key=='c'){
                invoke('write_pty',{id,data:'\x03'})
                return
            }
            if(key =='u' || key=='w'){
                invoke('write_pty',{id,data:'\x15'})
                cmd=''
                return
            }
            if(key =='l'){
                invoke('write_pty',{id,data:'\f'})
                cmd=''
                return
            }
            if(key =='e'){
                invoke('write_pty',{id,data:'\x05'})
                cmd=''
                return
            }
            if(key =='d'){
                invoke('write_pty',{id,data:'\x04'})
                cmd=''
                return
            }
            if(key =='a'){
                invoke('write_pty',{id,data:'\x01'})
                cmd=''
                return
            }
            if(key =='k'){
                invoke('write_pty',{id,data:'\x0b'})
                cmd=''
                return
            }
            if(key =='z'){
                invoke('write_pty',{id,data:'\x1a'})
                cmd=''
                return
            }
        }
        
        if(fromOnData){
            fromOnData=false;
        }else{
            if(!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey)
            invoke('write_pty',{id,data:key})
        }
    }
    
    
    window.onresize =resize
    onMount(()=>{
        zsh()
    })
</script>
<body class="h-screen w-screen bg-gray-800">
    <div class="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4">
        <button on:click={zsh} type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
                 <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
             </svg>
            <span class="sr-only">Attach file</span>
        </button>
        <button on:click={close} type="button" class="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
                 <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
             </svg>
            <span class="sr-only">Attach file</span>
        </button>
        
    </div>
    <div class="overflow-y-auto">
      <div id="terminal"  class="h-full"/>
    </div>
    <footer class="bg-white rounded-lg shadow m-4 dark:bg-gray-800">
        <input bind:value={cmd}  on:keydown={keydown} on:input={onInput}   class="w-full">
    </footer>
  </body>
