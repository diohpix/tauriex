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
    
    let PRE_PROCESS:any[]=[];
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
        closeAll();
    })

    $:{
      const j = job.pop();
      if(j!==undefined){
        const process = PRE_PROCESS.find(t=>t.id ==j.id);
        const interval = setInterval(()=>{
            if(process.ref!==undefined){
              const copiedObj = Object.assign({}, j);
              //console.log(copiedObj)
              copiedObj.ref=undefined;
              //const oo = {id:j.id,name:j.name,command:j.command,args:j.args,env:j.env,icon:j.icon}
              process.ref.setShell(copiedObj)
              clearInterval(interval);
            }
        },100)
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
       console.log('push',job)
       PRE_PROCESS.push(shell);
       console.log('process',PRE_PROCESS)
       console.log('---------------shell---------------')
       job=job
       PRE_PROCESS = PRE_PROCESS;
    }
    
    function handleMultiInvoke(e:CustomEvent){
      PRE_PROCESS.forEach(value=>{
        value.ref.setMessage(e.detail.msg)
      })
    }
    function titleChange(e:CustomEvent){
      var process = PRE_PROCESS.find(t=>t.id ==e.detail.id);
      process.command = e.detail.command;
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
      console.log('focus');
      var process = PRE_PROCESS.find(t=>t.id ==shell.id);
      process.ref.focus();
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
    async function exitTab(e:any){
      console.log('exittab')
        await closeTabById(e.detail.id);
    }
    async function closeTabById(id:string){
      console.log('closetab ',id,defaultTab);
      var process = PRE_PROCESS.find(t=>t.id ==id);
      if(process!==undefined){
        process.hide=true;
        
          const idx = PRE_PROCESS.findIndex(t=>t.id == id);
          if(idx == PRE_PROCESS.length-1){
            console.log('nidx 0 ',(idx-1))
            defaultTab=PRE_PROCESS[idx-1].id;
          }else{
            console.log('nidx 1 ',(idx+2))
            defaultTab=PRE_PROCESS[idx+1].id;
          }        
        
        //PRE_PROCESS=PRE_PROCESS;
      }
    }
    async function closeAll(){
      PRE_PROCESS.forEach(e=>{
        invoke('kill_pty',{id:`${e.id}`});
      })
    }
</script>
<Tabs value="{defaultTab}" class="w-full" >
  <TabsList>
    {#each PRE_PROCESS as process}
      {#if process.hide==undefined}
      <TabsTrigger value="{process.id}"><div on:click={closeTabById(process.id)} class="w-4">x</div><div  on:click={(e)=>focusTerm(process)}>{process.command}</div></TabsTrigger>
      {/if}
    {/each}
    <div class="grid w-6 bg-[#334155] justify-items-center" ><a href="#" on:click={zsh}>+</a></div>
  </TabsList>
  {#each PRE_PROCESS as process}
    {#if process.hide==undefined}
    <TabsContent value="{process.id}">
      <svelte:component this={XTerminal}  bind:this={process.ref} on:titleChange={titleChange} on:terminalStart={terminalStart}  on:exit={exitTab} on:openTab={zsh}/>
    </TabsContent>
    {/if}
  {/each}
</Tabs>
<button on:click={opendoc}>open</button>
<button on:click={changeUrl}>change</button>
<XTemCommand on:invoke={handleMultiInvoke}/>
<style>
  
</style>