<script lang="ts">
    import "../app.css";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	import { onDestroy, onMount, tick } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    import "tailwindcss/tailwind.css";
    import { appWindow } from '@tauri-apps/api/window'
	import { list } from "postcss";
    let listTerm: any[]=[];
    let unlisten:Function;
    let PROCESS:any={};
    let PROECESS_NAME:any={};
    let job:any[]=[];
    onMount(async ()=>{
        zsh()
        unlisten = await listen('EVENTS:PTY:STDOUT',async (event:any) => {
          
            const clientId = event.payload.clientId
            const id = event.payload.id
            const bytes = event.payload.bytes
            const j = job.pop();
            let term = PROCESS[id];
            if(j!==undefined && j.id == clientId){//새로운 콘솔
                /*var xt = XTerminal;
                listTerm.push(xt);
                listTerm = listTerm;
                await tick();
                var _term = listTerm[listTerm.length-1];
                console.log('b',_term)
                j.ptyId= id;
                _term.ref.setShell(j);
                
                PROCESS[id] = _term.ref
                selectedTab=listTerm.length-1;
                PROECESS_NAME[listTerm.length-1]='zsh'*/
                const a = new XTerminal({
                  target:document.querySelector("#dd")
                })
                a.$on('invoke',handleInvoke);
                j.ptyId=id;
                a.setShell(j)
                a.setMessage(bytes)
                invoke('write_pty',{id:id,data:'preexec() {echo -ne "$P1 ${USER}@${HOST} - $1 $P2";}\r\f'})
                                
                console.log(a)
                PROCESS[id] = a
            }else{
              term.setMessage(bytes)
            }
            
            
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
	      id: ''+Date.now(),
	      name: '12',
	      command: 'zsh',
	      args:[],
	      env: {'TERM':'xterm-256color','LANG':'ko_KR.UTF-8','TERM_PROGRAM_VERSION':"447",'P1':'\\x1b]0;','P2':'\\x07'},
	      icon: ''
       }
       job.push(shell);
       
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
    function changeTitle(e:any){
      console.log('changeTitle',e)
      PROECESS_NAME[0]=e.detail.msg
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
    function f(o:any){
      return o
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

<div role="tablist" id="dd" class="tabs tabs-bordered">
  <!--
  {#each listTerm as term ,i }
  <input type="radio" name="my_tabs_i" checked={i==selectedTab} role="tab" class="tab" aria-label="{PROECESS_NAME[i]}" />
  <div role="tabpanel" class="tab-content w-screen">
      <svelte:component this={term} bind:this={term.ref} on:invoke={handleInvoke} on:changeTitle={changeTitle}/> 
  </div>
  {/each}
-->
</div>

<XTemCommand on:invoke={handleMultiInvoke}/>


  