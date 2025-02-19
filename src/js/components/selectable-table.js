let dk = {
  "select_row": "Vælg række",
  "unselect_row": "Fravælg række",
  "select_all_rows": "Vælg alle rækker",
  "unselect_all_rows": "Fravælg alle rækker"
}

class TableSelectableRows {
  constructor (table, strings = dk) {
    this.table = table;
    dk = strings;
  }

  /**
   * Initialize eventlisteners for checkboxes in table
   */
  init(){
    this.groupCheckbox = this.getGroupCheckbox();
    this.tbodyCheckboxList = this.getCheckboxList();
    if(this.tbodyCheckboxList.length !== 0){
      for(let c = 0; c < this.tbodyCheckboxList.length; c++){
        let checkbox = this.tbodyCheckboxList[c];
        checkbox.removeEventListener('change', updateGroupCheck);
        checkbox.addEventListener('change', updateGroupCheck);
      }
    }
    if(this.groupCheckbox !== false){
      this.groupCheckbox.removeEventListener('change', updateCheckboxList);
      this.groupCheckbox.addEventListener('change', updateCheckboxList);
    }
  }
  
  /**
   * Get group checkbox in table header
   * @returns element on true - false if not found
   */
  getGroupCheckbox(){
    let checkbox = this.table.getElementsByTagName('thead')[0].getElementsByClassName('form-checkbox');
    if(checkbox.length === 0){
      return false;
    }
    return checkbox[0];
  }
  /**
   * Get table body checkboxes
   * @returns HTMLCollection
   */
  getCheckboxList(){
    return this.table.getElementsByTagName('tbody')[0].getElementsByClassName('form-checkbox');
  }
}

/**
 * Update checkboxes in table body when group checkbox is changed
 * @param {Event} e 
 */
function updateCheckboxList(e){
  let checkbox = e.target;
  checkbox.removeAttribute('aria-checked');
  let table = e.target.parentNode.parentNode.parentNode.parentNode;
  let tableSelectableRows = new TableSelectableRows(table);
  let checkboxList = tableSelectableRows.getCheckboxList();
  let checkedNumber = 0;
  if(checkbox.checked){
    for(let c = 0; c < checkboxList.length; c++){
      checkboxList[c].checked = true;
      checkboxList[c].parentNode.parentNode.classList.add('table-row-selected');
      checkboxList[c].nextElementSibling.setAttribute('aria-label', dk.unselect_row);
    }

    checkedNumber = checkboxList.length;
    checkbox.nextElementSibling.setAttribute('aria-label', dk.unselect_all_rows);
  } else{
    for(let c = 0; c < checkboxList.length; c++){
      checkboxList[c].checked = false;
      checkboxList[c].parentNode.parentNode.classList.remove('table-row-selected');
      checkboxList[c].nextElementSibling.setAttribute('aria-label', dk.select_row);
    }
    checkbox.nextElementSibling.setAttribute('aria-label', dk.select_all_rows);
  }
  
  const event = new CustomEvent("fds.table.selectable.updated", {
    bubbles: true,
    cancelable: true,
    detail: {checkedNumber}
  });
  table.dispatchEvent(event);
}

/**
 * Update group checkbox when checkbox in table body is changed
 * @param {Event} e 
 */
function updateGroupCheck(e){
  // update label for event checkbox
  if(e.target.checked){
    e.target.parentNode.parentNode.classList.add('table-row-selected');
    e.target.nextElementSibling.setAttribute('aria-label', dk.unselect_row);
  } else{
    e.target.parentNode.parentNode.classList.remove('table-row-selected');
    e.target.nextElementSibling.setAttribute('aria-label', dk.select_row);
  }
  let table = e.target.parentNode.parentNode.parentNode.parentNode;
  let tableSelectableRows = new TableSelectableRows(table);
  let groupCheckbox = tableSelectableRows.getGroupCheckbox();
  if(groupCheckbox !== false){
    let checkboxList = tableSelectableRows.getCheckboxList();

    // how many row has been selected
    let checkedNumber = 0;
    for(let c = 0; c < checkboxList.length; c++){
      let loopedCheckbox = checkboxList[c];
      if(loopedCheckbox.checked){
        checkedNumber++;
      }
    }
    
    if(checkedNumber === checkboxList.length){ // if all rows has been selected
      groupCheckbox.removeAttribute('aria-checked');
      groupCheckbox.checked = true;
      groupCheckbox.nextElementSibling.setAttribute('aria-label', dk.unselect_all_rows);
    } else if(checkedNumber == 0){ // if no rows has been selected
      groupCheckbox.removeAttribute('aria-checked');
      groupCheckbox.checked = false;
      groupCheckbox.nextElementSibling.setAttribute('aria-label', dk.select_all_rows);
    } else{ // if some but not all rows has been selected
      groupCheckbox.setAttribute('aria-checked', 'mixed');
      groupCheckbox.checked = false;
      groupCheckbox.nextElementSibling.setAttribute('aria-label', dk.select_all_rows);
    }
    const event = new CustomEvent("fds.table.selectable.updated", {
      bubbles: true,
      cancelable: true,
      detail: {checkedNumber}
    });
    table.dispatchEvent(event);
  }
}

module.exports = TableSelectableRows;
