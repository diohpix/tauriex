<script lang="ts">
    
    import "../app.pcss";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	  import { onDestroy, onMount, tick, } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    
    import { appWindow,WebviewWindow } from '@tauri-apps/api/window'
    
    import { Tabs ,TabsList,TabsTrigger,TabsContent}from "$lib/components/ui/tabs";
    import { window } from "@tauri-apps/api"
    import { register } from '@tauri-apps/api/globalShortcut';
    import { TauriEvent } from "@tauri-apps/api/event"

    


    
	
    let unlisten:Function;
    let PROCESS:any={};
    let PRE_PROCESS:any={};
    let job:any[]=[];
    let defaultTab='';
    onMount(async ()=>{
        zsh()
        window.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, () => {
          //alert("Closing window and maybe saving some data :)")
          console.log('closed request')
          closeTabById(defaultTab);
          return false
        })
    });
        
        
    
    onDestroy(()=>{
        close();
    })
    $:{
      const j = job.pop();
      if(j!==undefined){
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
    async function closedTab(e:any){
        await closeTabById(e.detail.id);
    }
    async function closeTabById(id:string){
      if(PRE_PROCESS[id]!==undefined){
        PRE_PROCESS[id].hide=true;
        await tick();
        delete PRE_PROCESS[id]
        PRE_PROCESS=PRE_PROCESS;
        if(Object.keys(PRE_PROCESS).length==0){
         appWindow.close();
        }
        Object.entries(PRE_PROCESS).forEach(([l,k])=>{
            defaultTab = l
        })
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
        PROCESS={}
    }
    
    function handleMultiInvoke(e:CustomEvent){
      for (const [key, value] of Object.entries(PRE_PROCESS)) {
          //invoke(e.detail.cmd,{id:`${key}`,data:e.detail.msg});
          console.log(e.detail)
          value.ref.setMessage(e.detail.msg)
          
      }
    }
    function titleChange(e:CustomEvent){
      PRE_PROCESS[e.detail.id].command = e.detail.command;
      if(defaultTab=== e.detail.id){
        appWindow.setTitle(e.detail.command);
      }
    }
    function terminalStart(e:CustomEvent){
      defaultTab=e.detail.id;
      console.log('termStart',e)
      appWindow.setTitle(e.detail.command);
    }
    
    function focusTerm(shell:any){
      PRE_PROCESS[shell.id].ref.focus();
      defaultTab=shell.id;
      appWindow.setTitle(shell.command);
    }
    let webview:any;
    function opendoc(){
      //invoke('open_docs');
      webview = new WebviewWindow('theUniqueLabel', {
        url: 'https://dooray.com/messenger/orgs',
      })
      webview.once('tauri://created', function () {
        // webview window successfully created
      })
      webview.once('tauri://error', function (e) {
      // an error occurred during webview window creation
      });
    }
    function changeUrl(){
      console.log(webview)
      webview.hide();
      //appWindow.setAlwaysOnTop(true)
      
    }
</script>
<Tabs value="{defaultTab}" class="w-full" >
  <TabsList>
    {#each Object.entries(PRE_PROCESS) as [id,shell]}
      <TabsTrigger on:click={(e)=>focusTerm(shell)} value="{id}"><div on:click={closeTabById(id)} class="w-4">x</div><div>{shell.command}</div></TabsTrigger>
    {/each}
    <div class="grid w-6 bg-[#334155] justify-items-center" ><a href="#" on:click={zsh}>+</a></div>
  </TabsList>
  {#each Object.entries(PRE_PROCESS) as [id,shell]}
    {#if shell.hide==undefined}
    <TabsContent value="{id}">
      <svelte:component this={XTerminal}  bind:this={PRE_PROCESS[id].ref} on:titleChange={titleChange} on:terminalStart={terminalStart}  on:closeTab={closedTab} on:openTab={zsh}/>
    </TabsContent>
    {/if}
  {/each}
</Tabs>
<button on:click={opendoc}>open</button>
<button on:click={changeUrl}>change</button>
<XTemCommand on:invoke={handleMultiInvoke}/>
<style>
  
</style>