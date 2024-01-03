<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onDestroy, onMount } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    import "tailwindcss/tailwind.css";
    import { appWindow } from '@tauri-apps/api/window'
    let listTerm: any[]=[];
    let unlisten:Function;
    let PROCESS:any={};
    let PROECESS_NAME:any={};
    onMount(async ()=>{
        zsh()
        unlisten = await listen('EVENTS:PTY:STDOUT', (event:any) => {
            const id = event.payload.id
            let term = PROCESS[id];
            if(term==null){
                var _term = listTerm.filter(t=>t.ID==null)[0];
                _term.ref.SetId(id)
                PROCESS[id] = _term.ref
                term =_term.ref;
                selectedTab=listTerm.length-1;
                PROECESS_NAME[listTerm.length-1]='zsh'
                term.setMessage('\x1b]2;foo\x9c')
            }
            const bytes = event.payload.bytes
            term.setMessage(bytes)
        })
        document?.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize())
        document?.getElementById('titlebar-maximize')?.addEventListener('click', () => appWindow.toggleMaximize())
        document?.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close())
        window.resizeTo(1024, 768);
    })
    onDestroy(()=>{
        close();
       
    })
    
    async function zsh(){
      let shell = {
	    id: '123423423',
	    name: '12',
	    command: 'zsh',
	    args:[],
	    env: {'TERM':'xterm-color','LANG':'ko_KR.UTF-8'},
	    icon: ''
       }
       var xt = XTerminal;
       listTerm.push(xt);
       listTerm = listTerm
       var a= await invoke('spawn_pty',{shell});
       console.log('---------------shell---------------')
       
    }
    async function close(){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke('kill_pty',{id:`${key}`});
        }
        unlisten();
        PROCESS={}
        listTerm=[];
    }
    
    function handleInvoke(e:CustomEvent){
     //   console.log(e);
        invoke(e.detail.cmd,e.detail.data);
    }
    function handleMultiInvoke(e:CustomEvent){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke(e.detail.cmd,{id:`${key}`,data:e.detail.msg});
        }
    }
    let selectedTab=-1;
   
</script>
<div data-tauri-drag-region class="titlebar">
  <div class="titlebar-button" id="titlebar-plus" on:click={zsh}>
    <img
    src="https://api.iconify.design/mdi:plus.svg"
    alt="plus"
    />
  </div>
  <div class="titlebar-button" id="titlebar-minimize">
    <img
    src="https://api.iconify.design/mdi:window-minimize.svg"
    alt="minimize"
    />
  </div>
  <div class="titlebar-button" id="titlebar-maximize">
    <img
    src="https://api.iconify.design/mdi:window-maximize.svg"
    alt="maximize"
    />
  </div>
  <div class="titlebar-button" id="titlebar-close">
    <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
  </div>
</div>

<div role="tablist" class="tabs tabs-bordered">
  {#each listTerm as term ,i }
  <input type="radio" name="my_tabs_i" checked={i==selectedTab} role="tab" class="tab" aria-label="{PROECESS_NAME[i]}" />
  <div role="tabpanel" class="tab-content w-screen">
      <svelte:component this={term} bind:this={term.ref} on:invoke={handleInvoke} /> 
  </div>
  {/each}
</div>
<XTemCommand on:invoke={handleMultiInvoke}/>


  