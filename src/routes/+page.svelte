<script lang="ts">
    
    import "../app.pcss";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	  import { onDestroy, onMount, tick, } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    import "tailwindcss/tailwind.css";
    import { appWindow } from '@tauri-apps/api/window'
	
    import { Tabs ,TabsList,TabsTrigger,TabsContent}from "$lib/components/ui/tabs";
	
	
	
	
    let unlisten:Function;
    let PROCESS:any={};
    let PRE_PROCESS:any={};
    let job:any[]=[];
    let ff:any;
    onMount(async ()=>{
        zsh()
       /* unlisten = await listen('EVENTS:PTY:STDOUT',async (event:any) => {
            const id = event.payload.id
            const bytes = event.payload.bytes
            const j = job.pop();
            let term = PROCESS[id];
            if(j!==undefined ){//새로운 콘솔
              const client_id = event.payload.client_id
              if( j.id == client_id){
                var o  = PRE_PROCESS[client_id].ref
                j.ptyId=id;
                o.setShell(j)
                o.setMessage(bytes)
                invoke('write_pty',{id:id,data:'preexec() {echo -ne "$P1 ${USER}@${HOST} - $1 $P2";}\r\f'})
                PROCESS[id] = o
              }
            }else if(term !==undefined){
              console.log(term,event)
              term.setMessage(bytes)
            }else{
              const client_id = event.payload.client_id
              delete PROCESS[id];
              delete PRE_PROCESS[client_id];
            }
        })*/
        document?.getElementById('titlebar-minimize')?.addEventListener('click', () => appWindow.minimize())
        document?.getElementById('titlebar-maximize')?.addEventListener('click', () => appWindow.toggleMaximize())
        document?.getElementById('titlebar-close')?.addEventListener('click', () => appWindow.close())
        
    })
    onDestroy(()=>{
        close();
    })
    $:{
      const j = job.pop();
      if(j!==undefined){
        console.log('job',j)
        const o  = PRE_PROCESS[j.id]
        const k = setInterval(()=>{
            if(o.ref!==undefined){
              const oo = {id:j.id,name:j.name,command:j.command,args:j.args,env:j.env,icon:j.icon}
              o.ref.setShell(oo)
              clearInterval(k);
            }
        },100)
     //   
      }
    }
    async function closedTab(id:any){
      delete PROCESS[id.detail.id];
      PRE_PROCESS[id.detail.client_id].hide=true;
      await tick();
      delete PRE_PROCESS[id.detail.client_id]
      PRE_PROCESS=PRE_PROCESS;
      if(Object.keys(PROCESS).length==0){
        appWindow.close();
      }
    }
      function  zsh(){
      let shell = {
	      id: ''+Date.now(),
	      name: 'zsh',
	      command: 'zsh',
	      args:[],
	      env: {'TERM':'xterm-256color','LANG':'ko_KR.UTF-8','P1':'\\x1b]0;','P2':'\\x07'},
	      icon: ''
       }
       job.push(shell);
       PRE_PROCESS[shell.id]=shell;
       console.log('process',PRE_PROCESS)
       //await tick();
       console.log('---------------shell---------------')
       
    }
    async function close(){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke('kill_pty',{id:`${key}`});
        }
     //   unlisten();
        PROCESS={}
    }
    
    function handleInvoke(e:CustomEvent){
        //console.log('invoke',e);
        invoke(e.detail.cmd,e.detail.data);
    }
    function handleMultiInvoke(e:CustomEvent){
        for (const [key, value] of Object.entries(PROCESS)) {
            invoke(e.detail.cmd,{id:`${key}`,data:e.detail.msg});
        }
    }
   
    
   
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

<Tabs value="account" class="w-full" >  
  <TabsList>
    {#each Object.entries(PRE_PROCESS) as [id,shell]}
      <TabsTrigger value="{id}">{shell.command}</TabsTrigger>
    {/each}
  </TabsList>
  {#each Object.entries(PRE_PROCESS) as [id,shell]}
    {#if shell.hide==undefined}
    <TabsContent value="{id}">
      <svelte:component this={XTerminal}  bind:this={PRE_PROCESS[id].ref} on:invoke={handleInvoke} on:closeTab={closedTab} on:openTab={zsh}/>
    </TabsContent>
    {/if}
  {/each}
</Tabs>
<XTemCommand on:invoke={handleMultiInvoke}/>