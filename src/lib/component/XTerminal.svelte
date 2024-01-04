<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
    import {Xterm} from './Xterm'
    import 'xterm/css/xterm.css'
    let termdiv:HTMLElement;
    let xterm:any;
    export let shell:any=null;
    const dispatch = createEventDispatcher()
    export  function setShell(shell:any){
        shell=shell;
        xterm = new Xterm(shell.ptyId,termdiv,(cmd:string,obj:Object)=>{
            dispatch('invoke',{cmd:cmd,data:obj}); 
        },(title:string)=>{
            dispatch('changeTitle',{msg:title,shell:shell})
        });
    }
    export  function setMessage(msg:string){
        xterm.setMessage(msg);
    }
    onMount( async ()=>{
        console.log('mount terminal')
        await tick();
        setTimeout( ()=>{
            
            resize()
        },100)
    })   
    onDestroy(()=>{
        
        dispatch('invoke',{cmd:'kill_pty',data:shell.ptyId})
    })
    function resize(){
        console.log('resize')
        
        if(xterm!==undefined)
        xterm.fitAddon.fit();
    }
    window.onresize=resize
</script>
<input type="radio" name="my_tabs_i" checked={true} role="tab" class="tab" aria-label="Tab1" />
<div role="tabpanel" class="tab-content w-screen">
<div class="term" bind:this={termdiv} on:resize={resize} />
</div>
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