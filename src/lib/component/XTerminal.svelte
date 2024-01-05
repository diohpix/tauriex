<script lang="ts">
    import { Tabs ,TabsList,TabsTrigger,TabsContent}from "$lib/components/ui/tabs";
    import {get_current_component} from 'svelte/internal'
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
    import {Xterm} from './Xterm'
    import { invoke } from '@tauri-apps/api/tauri'
    import 'xterm/css/xterm.css'
    import { emit, listen } from '@tauri-apps/api/event'
    const THISComponent = get_current_component()
    let programName:string=''
    let termdiv:HTMLElement;
    let xterm:any;
    let shell:any=null;
    let id:string;
    let unlisten:Function;
    const dispatch = createEventDispatcher()
    export async  function setShell(sh:any){
        shell=sh;
        unlisten = await listen(shell.id,async (event:any) => {
            shell.ptyId = event.payload.id
            const bytes = event.payload.bytes
            console.log('read',bytes.length)
            xterm.setMessage(bytes)
        })
        programName = shell.command;
        console.log('programName',shell)
        xterm = new Xterm(shell,termdiv,(cmd:string,obj:any)=>{
            invoke(cmd,obj);
        },(cmd:string,title:string)=>{
            console.log(cmd)
            if(cmd=='titleChange'){
                programName=title;
                shell.command = title;
            }else if(cmd=='closeTab'){
                dispatch(cmd,{id:shell.ptyId,client_id:shell.id})
                close();
            }else if(cmd=='openTab'){
                dispatch(cmd)
            } 
        });
        await invoke('spawn_pty',{shell});
    }
    
    export  function setMessage(msg:string){
        if(xterm!==undefined)
        xterm.setMessage(msg);
    }
    onMount( async ()=>{
        console.log('mount terminal')   
    })   
    onDestroy(()=>{          
        console.log('destroy')  
        invoke('invoke',{cmd:'kill_pty',data:{id:shell.ptyId}})
        unlisten();
    })
    
    function close(){
        THISComponent.$destroy();
    }

    
</script>



<div class="term" bind:this={termdiv}  />



<style>
    
    .term {
      overflow: auto;
      background: #000;
      width: 100%;
      height: -webkit-calc(100% - (132px));
      height: -moz-calc(100% - (132px));
      height: calc(100vh - (132px));
      font-size: 10px;
      line-height: 17px; /* <- initial line-height */
    }
</style>