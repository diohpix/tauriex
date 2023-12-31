<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import ansiEscapes from 'ansi-escapes';
    const dispatch = createEventDispatcher()
    let composingStart = false;
    let deleteKey = false;
    let fromOnData = false;
    let cmd:any='';
    function invoke(cmd:string,msg:Object){
        dispatch('invoke',{cmd:cmd,msg:msg});
    }
    function onInput(e:Event){
        if(e instanceof InputEvent){
            const key = e.data;
            const inputType =e.inputType;
            
            if(key !==null){
                const keyCode = key?.charCodeAt(0)
                var curpos=false
                if( (keyCode < 12593 || keyCode > 12643) && (keyCode < 44032 || keyCode > 55203) ){
                    curpos = false
                }else{
                    curpos = true
                }
                console.log('input',inputType,key,composingStart,curpos)
                if( inputType==='insertText' ){ 
                    if(composingStart){ 
                        invoke('write_pty','\u001b[C'+key+'\u001b[D')
                        console.log('pos1')
                    }else{
                        if(curpos){
                            invoke('write_pty',key+'\u001b[D')
                            composingStart=true
                            console.log('pos2')
                        }else{
                            invoke('write_pty',key)
                            composingStart=false
                            console.log('pos3')
                        }
                    }
                }else{
                    invoke('write_pty','\u001b[3~'+key+'\u001b[D')
                    console.log('pos4',deleteKey)
                }
                fromOnData=true
            }    
        }
    }
    
    function keydown(e:KeyboardEvent){
        
        const key = e.key;
        console.log('keydown',key)
        if(key =="Backspace" || key =="Delete"){
            console.log('compo',composingStart)
            if(composingStart){
                if(deleteKey){
                    invoke('write_pty','\u001b[3~')
                    composingStart=false
                }
            }else{
                invoke('write_pty','\x08')
            }
            deleteKey=true
            return
        }
        
        deleteKey=false
        if(key =="Enter"){
            invoke('write_pty','\x0D')
            cmd=''
            return
        }
        
        if(key =="Escape"){
            invoke('write_pty','\x1B')
            return
        }
        
        if(key =="Tab"){
            invoke('write_pty','\t')
            return
        }
        if(key =="ArrowUp"){
            invoke('write_pty',ansiEscapes.cursorUp(1).replace('[1','['))
            return
        }
        if(key =="ArrowDown"){
            invoke('write_pty',ansiEscapes.cursorDown(1).replace('[1','['))
            return
        }
        if(key =="ArrowLeft"){
            
            invoke('write_pty',ansiEscapes.cursorBackward(1).replace('[1','['))
            return
        }
        if(key =="ArrowRight"){
            
            invoke('write_pty',ansiEscapes.cursorForward(1).replace('[1','['))
            return
        }
        if(e.ctrlKey){
            if( key=='c'){
                invoke('write_pty','\x03')
                return
            }
            if(key =='u' || key=='w'){
                invoke('write_pty','\x15')
                cmd=''
                return
            }
            if(key =='l'){
                invoke('write_pty','\f')
                cmd=''
                return
            }
            if(key =='e'){
                invoke('write_pty','\x05')
                cmd=''
                return
            }
            if(key =='d'){
                invoke('write_pty','\x04')
                cmd=''
                return
            }
            if(key =='a'){
                invoke('write_pty','\x01')
                cmd=''
                return
            }
            if(key =='k'){
                invoke('write_pty','\x0b')
                cmd=''
                return
            }
            if(key =='z'){
                invoke('write_pty','\x1a')
                cmd=''
                return
            }
        }
        if(fromOnData){
            fromOnData=false;
        }else{
          //  if(!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey)
         //   invoke('write_pty',key)
          //  fromOnData=true
        }
    }
</script>
<input bind:value={cmd} autocomplete="off"  on:keydown={keydown} on:input={(e)=>onInput(e)}   class="w-full">