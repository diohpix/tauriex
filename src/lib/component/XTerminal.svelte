<script lang="ts">
    import { Tabs ,TabsList,TabsTrigger,TabsContent}from "$lib/components/ui/tabs";
    import {get_current_component} from 'svelte/internal'
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
    import {Xterm} from './Xterm'
    import 'xterm/css/xterm.css'
    const THISComponent = get_current_component()
    let programName:string=''
    let termdiv:HTMLElement;
    let xterm:any;
     let shell:any=null;
    
    const dispatch = createEventDispatcher()
    export  function setShell(sh:any){
        shell=sh;
        programName = shell.command;
        console.log('programName',shell)
        xterm = new Xterm(shell.ptyId,termdiv,(cmd:string,obj:Object)=>{
            dispatch('invoke',{cmd:cmd,data:obj}); 
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
    }
    export  function setMessage(msg:string){
        if(xterm!==undefined)
        xterm.setMessage(msg);
    }
    onMount( async ()=>{
        console.log('mount terminal')
        await tick();
        setTimeout( ()=>{
            
           // resize()
        },100)
    })   
    onDestroy(()=>{          
        console.log('destroy')  
        dispatch('invoke',{cmd:'kill_pty',data:{id:shell.ptyId}})
        console.log('send kill')  
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