function PillButton(props) {
  const classes = styles(props);
  const { label, color, handleClick, loading, disabled, showLockIcon, flat, dataCypress } = props; //Flat prop will make the button look longer with and extra padding
  
  return (
    <Button
      className={`${classes.rootButton} ${colorBtn} ${flat} ${classes.flatBtn}`}
      disabled={disabled}
      onClick={handleClick}
      data-cy={dataCypress}
    >
    </Button>
  );
}

export default PillButton;
