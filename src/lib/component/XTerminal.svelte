<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte';
    import {Xterm} from './Xterm'
    import 'xterm/css/xterm.css'
    let termdiv:HTMLElement;
    let xterm:any;
    export let ID=null;
    const dispatch = createEventDispatcher()
    export  function SetId(id:string){
        ID=id;
        xterm = new Xterm(id,termdiv,(cmd:string,obj:Object)=>{
            dispatch('invoke',{cmd:cmd,data:obj}); 
        });
    }
    export  function setMessage(msg:string){
        xterm.setMessage(msg);
    }
    onMount( async ()=>{
        console.log('mount terminal')
        await tick();
        setTimeout( ()=>{
            termdiv.focus();
            resize()
        },100)
    })   
    function resize(){
        console.log('resize')
        
        if(xterm!==undefined)
        xterm.fitAddon.fit();
    }
    window.onresize=resize
</script>
<div class="term" bind:this={termdiv} on:resize={resize} />
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