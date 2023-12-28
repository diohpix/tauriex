<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onMount } from "svelte";
    import {Terminal} from 'xterm'
    import { FitAddon } from 'xterm-addon-fit';
    import {WebglAddon} from 'xterm-addon-webgl'
    import 'xterm/css/xterm.css'
    
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
        term.textarea.addEventListener('input',(e:any)=>{
            console.log('input ',e)
        })
        
        term.onData((data:any) => {
            invoke('write_pty',{id,data})
        });
        
        unlisten = await listen('EVENTS:PTY:STDOUT', (event:any) => {
            id = event.payload.id
            const bytes = event.payload.bytes
            term.write(bytes)
        })
    })
    async function zsh(){
       var a= await invoke('spawn_pty',{shell});
       console.log('a',a)
    }
    function resize(){
        fitAddon.fit();
        invoke('resize_pty',{id,size:{rows:120,cols:100,pixel_width:1024,pixel_height:1024}})
    }
    async function ls(){
        
        invoke('write_pty',{id,data:'ls\n'})
        unlisten();
    }
    async function close(){
        invoke('kill_pty',{id})
        unlisten();
    }
    function send(e:InputEvent){
        console.log(e)
        
            invoke('write_pty',{id,data:e.data})
        
    }
    function cr(e:KeyboardEvent){
        if(e.key=="Enter"){
            invoke('write_pty',{id,data:'\n'})
            cmd=''
        }
    }
    let cmd:any;
    window.onresize =resize
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
        <input bind:value={cmd} on:keydown={cr} on:input={send} class="w-full">
    </footer>
  </body>
