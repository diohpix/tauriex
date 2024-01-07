<script lang="ts">
    
    import "../app.pcss";
    import { invoke } from '@tauri-apps/api/tauri'
    import { Command } from '@tauri-apps/api/shell'
    import { emit, listen } from '@tauri-apps/api/event'
	  import { onDestroy, onMount, tick, } from "svelte";
    import XTerminal from '../lib/component/XTerminal.svelte'
    import XTemCommand from '../lib/component/Command.svelte'
    
    import { appWindow,WebviewWindow } from '@tauri-apps/api/window'
    
	
  
	
	
	
	
    let unlisten:Function;
    let PROCESS:any={};
    let PRE_PROCESS:any={};
    let job:any[]=[];
    let defaultTab='';
    onMount(async ()=>{
        zsh()
       
        
        
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
    async function closedTab(e:any){
      
      PRE_PROCESS[e.detail.id].hide=true;
      await tick();
      delete PRE_PROCESS[e.detail.id]
      PRE_PROCESS=PRE_PROCESS;
      if(Object.keys(PRE_PROCESS).length==0){
       // appWindow.close();
      }
      Object.entries(PRE_PROCESS).forEach(([l,k])=>{
          defaultTab = l
          console.log('def',defaultTab)
      })
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



    {#each Object.entries(PRE_PROCESS) as [id,shell]}
      <a on:click={(e)=>focusTerm(shell)} value="{id}"><div>{shell.command}</div></a>
    {/each}
    <div class="grid w-6 justify-items-center" ><a href="#" on:click={zsh}>+</a></div>

  {#each Object.entries(PRE_PROCESS) as [id,shell]}
    {#if shell.hide==undefined}

      <svelte:component this={XTerminal}  bind:this={PRE_PROCESS[id].ref} on:titleChange={titleChange} on:terminalStart={terminalStart}  on:closeTab={closedTab} on:openTab={zsh}/>
    
    {/if}
  {/each}

<button on:click={opendoc}>open</button>
<button on:click={changeUrl}>change</button>
<XTemCommand on:invoke={handleMultiInvoke}/>
<style>
  body {
    margin-top: 50px;
  }
  .titlebar {
  height: 30px;
  background: #000000;
  user-select: none;
  display: flex;
  justify-content: flex-start;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
.titlebar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
}
.titlebar-button:hover {
  background: #c36c5b;
}
</style>