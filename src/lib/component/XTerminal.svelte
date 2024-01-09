<script lang="ts">
    
    import {get_current_component} from 'svelte/internal'
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
    import {Xterm} from './Xterm'
    import { invoke } from '@tauri-apps/api/tauri'
    import 'xterm/css/xterm.css'
    import { emit, listen } from '@tauri-apps/api/event'
    const THISComponent = get_current_component()
    let termdiv:HTMLElement;
    let xterm:any;
    let shell:any=null;
    let id:string;
    let unlisten:Function;
    let unlisten_exit:Function;
    const dispatch = createEventDispatcher()
    export async  function setShell(sh:any){
        shell=sh;
        unlisten = await listen(shell.id,async (event:any) => {
            const bytes = event.payload.bytes
            if(shell.ptyId == undefined){
                invoke('write_pty',{id:event.payload.id,data:'preexec() {echo -ne "$P1 ${USER}@${HOST} - $1 $P2";}\r\f'})
                shell.ptyId = event.payload.id
                dispatch('terminalStart',shell);
            }
            xterm.setMessage(bytes)
        })
        unlisten_exit = await listen('EVENTS:PTY:EXIT',async (event:any) => {
            console.log('EXIT',event.payload.id,shell)
            if(event.payload.id === shell.ptyId){
                dispatch('closeTab',shell)
                close();
            }
        })
        xterm = new Xterm(shell,termdiv,(cmd:string,obj:any)=>{
            invoke(cmd,obj);
        },(cmd:string,title:string)=>{
            if(cmd=='titleChange'){
                shell.command = title;
                dispatch('titleChange',shell);
            }else if(cmd=='closeTab'){
                dispatch(cmd,shell)
                close();
            }else if(cmd=='openTab'){
                dispatch(cmd)
            } 
        });
        await invoke('spawn_pty',{shell});
    }
    export function focus(){
        xterm.focus();
    }
    export  function setMessage(msg:string){
        invoke('write_pty',{id:shell.ptyId,data:msg})
    }
    onMount( async ()=>{
        console.log('mount terminal')   
    })   
    onDestroy(()=>{          
        unlisten();
        unlisten_exit();
        console.log('destroy kill')  
        invoke('kill_pty',{id:shell.ptyId})
        
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